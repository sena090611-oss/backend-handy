import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
// Servicio que encapsula la lógica de negocio de la entidad User.
// Se importan tanto la entidad User como la entidad Municipio para poder
// crear la relación FK "id_municipio" al crear o actualizar usuarios.
import { User, UserRole, UserStatus } from './entities/user.entity';
import { Municipio } from '../municipio/entities/municipio.entity';
// Entidades usadas solo para consultar si el usuario tiene registros
// asociados que impiden su borrado físico (solicitudes, ficha trabajador).
import { SolicitudDeServicio } from '../solicitud_de_servicio/entities/solicitud-de-servicio.entity';
import { Trabajador } from '../trabajador/entities/trabajador.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateOwnUserDto } from './dto/update-own-user.dto';

@Injectable()
export class UserService {
  // Número de rondas de encriptación de bcrypt
  private readonly saltRounds = 10;

  constructor(
    // Inyección del repositorio de User
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Municipio)
    private readonly municipioRepository: Repository<Municipio>,
  ) {}

  /**
   * Crear un nuevo usuario
   * Encripta la contraseña antes de guardarla
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // -----------------------------------------------------------------
    // 1️⃣  Verificar la unicidad del email antes de crear.
    // -----------------------------------------------------------------
    const emailTaken: boolean = await this.userRepository.existsBy({
      email: createUserDto.email,
    });
    if (emailTaken) {
      throw new ConflictException('El email ya está registrado');
    }

    const municipio = await this.findMunicipio(createUserDto.id_municipio);

    // -----------------------------------------------------------------
    // 2️⃣  Encriptar la contraseña recibida.
    // -----------------------------------------------------------------
    const hashedPassword: string = await bcrypt.hash(
      createUserDto.password,
      this.saltRounds,
    );

    // -----------------------------------------------------------------
    // 3️⃣  Preparar los datos que van a la entidad User.
    //    - "nombre" del DTO se almacena en la columna "fullName".
    //    - "role" es opcional; si no llega el valor, la entidad usará el
    //      default definido en la entidad ("cliente").
    //    - Si se envía "id_municipio", se crea la relación Municipio.
    // -----------------------------------------------------------------
    const userData: Partial<User> = {
      email: createUserDto.email,
      password: hashedPassword,
      fullName: createUserDto.nombre ?? createUserDto.fullName,
      role: createUserDto.role,
      isActive: UserStatus.PENDIENTE,
      municipio,
    };

    const user: User = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  /**
   * Obtener todos los usuarios
   * No incluye las contraseñas (select: false en la entidad)
   */
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  /**
   * Obtener un usuario por ID.
   * Lanza 404 si no existe. Solo el propio usuario o un administrador
   * pueden ver los datos completos; el resto recibe 403.
   */
  async findOne(id: number, solicitante: User): Promise<User> {
    this.verificarAcceso(id, solicitante);
    return await this.buscarPorId(id);
  }

  async findMine(usuario: User): Promise<User> {
    return this.buscarPorId(usuario.id);
  }

  async updateMine(
    usuario: User,
    dto: UpdateOwnUserDto,
  ): Promise<User> {
    const user = await this.buscarPorId(usuario.id);
    if (dto.nombre !== undefined) {
      user.fullName = dto.nombre.trim();
    }
    if (dto.id_municipio !== undefined) {
      user.municipio = await this.findMunicipio(dto.id_municipio);
    }
    return this.userRepository.save(user);
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: { id: true, password: true },
    });
    if (!user?.password) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }
    user.password = await bcrypt.hash(newPassword, this.saltRounds);
    await this.userRepository.save(user);
  }

  /**
   * Verifica que el solicitante pueda consultar los datos del usuario con el
   * ID indicado: solo el propio usuario o un administrador.
   */
  private verificarAcceso(id: number, solicitante: User): void {
    if (solicitante.role !== UserRole.ADMIN && solicitante.id !== id) {
      throw new ForbiddenException(
        'No tienes permisos para ver los datos de otro usuario',
      );
    }
  }

  /**
   * Busca un usuario por ID sin validar permisos (uso interno del servicio).
   * Lanza 404 si no existe.
   */
  private async buscarPorId(id: number): Promise<User> {
    const user: User | null = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  /**
   * Buscar un usuario por ID sin lanzar excepción
   * Devuelve null si no existe (lo usa la estrategia JWT)
   */
  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOneBy({ id });
  }

  /**
   * Buscar usuario por email
   * Incluye la contraseña (solo para autenticación)
   * Devuelve null si el email no está registrado
   */
  async findOneByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        fullName: true,
        role: true,
        isActive: true,
      },
    });
  }

  /**
   * Actualizar un usuario
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // -----------------------------------------------------------------
    // 1️⃣  Buscar el usuario existente (lanza 404 si no existe).
    // -----------------------------------------------------------------
    const user: User = await this.buscarPorId(id);

    // -----------------------------------------------------------------
    // 2️⃣  Si el email cambia, asegurarse de que siga siendo único.
    // -----------------------------------------------------------------
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailTaken: boolean = await this.userRepository.existsBy({
        email: updateUserDto.email,
      });
      if (emailTaken) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    // -----------------------------------------------------------------
    // 3️⃣  Preparar objeto con los cambios. Se parte de una copia shallow
    //     del DTO para evitar mutar el objeto recibido.
    // -----------------------------------------------------------------
    const { nombre, id_municipio, ...userFields } = updateUserDto;
    const changes: Partial<User> = { ...userFields };

    // -----------------------------------------------------------------
    // 4️⃣  Encriptar la nueva contraseña, si la hay.
    // -----------------------------------------------------------------
    if (changes.password) {
      changes.password = await bcrypt.hash(changes.password as string, this.saltRounds);
    }

    // -----------------------------------------------------------------
    // 5️⃣  Mapear campos específicos al nombre de las columnas de la entidad.
    // -----------------------------------------------------------------
    if (nombre !== undefined) {
      changes.fullName = nombre;
    }
    if (id_municipio !== undefined) {
      changes.municipio = await this.findMunicipio(id_municipio);
    }

    // -----------------------------------------------------------------
    // 6️⃣  Aplicar los cambios al modelo y persistir.
    // -----------------------------------------------------------------
    this.userRepository.merge(user, changes);
    return await this.userRepository.save(user);
  }

  private async findMunicipio(id: number): Promise<Municipio> {
    if (!Number.isInteger(id)) {
      throw new BadRequestException('id_municipio debe ser un número entero');
    }

    const municipio = await this.municipioRepository.findOneBy({ id });
    if (!municipio) {
      throw new NotFoundException(`Municipio con ID ${id} no encontrado`);
    }
    return municipio;
  }

  /**
   * Eliminar un usuario.
   *
   * Si el usuario tiene registros asociados (solicitudes de servicio o ficha
   * de trabajador) NO se borra físicamente: la FK lo impediría con un error
   * de base de datos. En su lugar se hace un borrado lógico, pasando su
   * estado a SUSPENDIDO, y el endpoint responde igualmente 204.
   *
   * Si no tiene registros asociados, se elimina físicamente.
   */
  async remove(id: number): Promise<void> {
    const user: User = await this.buscarPorId(id);

    const manager = this.userRepository.manager;

    // ¿Tiene solicitudes de servicio asociadas (FK id_usuario)?
    const tieneSolicitudes: boolean = await manager.exists(
      SolicitudDeServicio,
      { where: { usuario: { id } } },
    );

    // ¿Tiene ficha de trabajador asociada (FK id_usuario en trabajador)?
    const tieneFichaTrabajador: boolean = await manager.exists(Trabajador, {
      where: { usuario: { id } },
    });

    if (tieneSolicitudes || tieneFichaTrabajador) {
      // Borrado lógico: se suspende la cuenta en lugar de eliminarla.
      await this.userRepository.update(id, {
        isActive: UserStatus.SUSPENDIDO,
      });
      return;
    }

    // Sin registros asociados: borrado físico.
    await this.userRepository.remove(user);
  }
}