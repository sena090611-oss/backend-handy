import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Municipio } from '../municipio/entities/municipio.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { Zona } from '../zona/entities/zona.entity';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import { UpdateEstadoTrabajadorDto } from './dto/update-estado-trabajador.dto';
import { UpdateTrabajadorDto } from './dto/update-trabajador.dto';
import {
  EstadoTrabajador,
  Trabajador,
} from './entities/trabajador.entity';
import { Calificacion } from '../calificacion/entities/calificacion.entity';

@Injectable()
export class TrabajadorService {
  constructor(
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Zona)
    private readonly zonaRepository: Repository<Zona>,
    @InjectRepository(Municipio)
    private readonly municipioRepository: Repository<Municipio>,
    // Repositorio para acceder a las calificaciones y calcular promedios
    @InjectRepository(Calificacion)
    private readonly calificacionRepository: Repository<Calificacion>,
  ) {}

  async create(dto: CreateTrabajadorDto): Promise<Trabajador> {
    const usuario = await this.findTrabajadorUser(dto.usuarioId);
    const fichaExistente = await this.trabajadorRepository.findOneBy({
      usuario: { id: dto.usuarioId },
    });
    if (fichaExistente) {
      throw new ConflictException(
        `El usuario con ID ${dto.usuarioId} ya tiene una ficha de trabajador`,
      );
    }

    await this.ensureEmailAvailable(dto.email);
    await this.ensureDocumentAvailable(dto.numDoc);

    const municipio = await this.findMunicipio(dto.municipioId);
    const zona = await this.findZoneInMunicipio(dto.zonaId, municipio.id);
    const trabajador = this.trabajadorRepository.create({
      usuario,
      municipio,
      zona,
      tipoDoc: dto.tipoDoc,
      email: dto.email.trim(),
      numDoc: dto.numDoc.trim(),
      nombres: dto.nombres.trim(),
      apellidos: dto.apellidos.trim(),
      direccion: dto.direccion.trim(),
      telefono: dto.telefono.trim(),
      foto: dto.foto,
      nivelFormacion: dto.nivelFormacion,
      recomendaciones: dto.recomendaciones,
      estado: EstadoTrabajador.PENDIENTE,
    });

    return this.trabajadorRepository.save(trabajador);
  }

  async findAll(): Promise<Trabajador[]> {
    return this.trabajadorRepository.find({
      relations: { usuario: true, zona: true, municipio: true },
      order: { id: 'ASC' },
    });
  }

  // Obtiene un trabajador y agrega su promedio de calificación
  async findOne(id: number): Promise<Trabajador & { promedioCalificacion?: number }> {
    const trabajador = await this.trabajadorRepository.findOne({
      where: { id },
      relations: { usuario: true, zona: true, municipio: true },
    });
    if (!trabajador) {
      throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
    }
    // Consulta el promedio de puntuaciones de sus calificaciones
    const result = await this.calificacionRepository
      .createQueryBuilder('calif')
      .innerJoin('calif.solicitud', 'sol')
      .where('sol.id_trabajador = :trabajadorId', { trabajadorId: id })
      .select('AVG(calif.puntuacion)', 'avg')
      .getRawOne();
    const promedio = Number(result?.avg) || 0; // si no hay calificaciones, 0
    // Devuelve el trabajador con la nueva propiedad promedioCalificacion
    return { ...trabajador, promedioCalificacion: promedio };
  }

  async update(id: number, dto: UpdateTrabajadorDto): Promise<Trabajador> {
    const trabajador = await this.findOne(id);

    if (dto.email !== undefined && dto.email !== trabajador.email) {
      await this.ensureEmailAvailable(dto.email, id);
      trabajador.email = dto.email.trim();
    }
    if (dto.numDoc !== undefined && dto.numDoc !== trabajador.numDoc) {
      await this.ensureDocumentAvailable(dto.numDoc, id);
      trabajador.numDoc = dto.numDoc.trim();
    }

    const municipioId = dto.municipioId ?? trabajador.municipio.id;
    const zonaId = dto.zonaId ?? trabajador.zona.id;
    trabajador.municipio = await this.findMunicipio(municipioId);
    trabajador.zona = await this.findZoneInMunicipio(zonaId, municipioId);

    if (dto.tipoDoc !== undefined) trabajador.tipoDoc = dto.tipoDoc;
    if (dto.nombres !== undefined) trabajador.nombres = dto.nombres.trim();
    if (dto.apellidos !== undefined) trabajador.apellidos = dto.apellidos.trim();
    if (dto.direccion !== undefined) trabajador.direccion = dto.direccion.trim();
    if (dto.telefono !== undefined) trabajador.telefono = dto.telefono.trim();
    if (dto.foto !== undefined) trabajador.foto = dto.foto;
    if (dto.nivelFormacion !== undefined) {
      trabajador.nivelFormacion = dto.nivelFormacion;
    }
    if (dto.recomendaciones !== undefined) {
      trabajador.recomendaciones = dto.recomendaciones;
    }

    await this.trabajadorRepository.save(trabajador);
    return this.findOne(id);
  }

  async updateEstado(
    id: number,
    dto: UpdateEstadoTrabajadorDto,
  ): Promise<Trabajador> {
    const trabajador = await this.findOne(id);
    trabajador.estado = dto.estado;
    await this.trabajadorRepository.save(trabajador);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const trabajador = await this.findOne(id);
    await this.trabajadorRepository.remove(trabajador);
  }

  private async findTrabajadorUser(id: number): Promise<User> {
    const usuario = await this.userRepository.findOneBy({ id });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    if (usuario.role !== UserRole.TRABAJADOR) {
      throw new BadRequestException(
        `El usuario con ID ${id} no tiene el rol trabajador`,
      );
    }
    return usuario;
  }

  private async findMunicipio(id: number): Promise<Municipio> {
    const municipio = await this.municipioRepository.findOneBy({ id });
    if (!municipio) {
      throw new NotFoundException(`Municipio con ID ${id} no encontrado`);
    }
    return municipio;
  }

  private async findZoneInMunicipio(
    zonaId: number,
    municipioId: number,
  ): Promise<Zona> {
    const zona = await this.zonaRepository.findOne({
      where: { id: zonaId },
      relations: { municipio: true },
    });
    if (!zona) {
      throw new NotFoundException(`Zona con ID ${zonaId} no encontrada`);
    }
    if (zona.municipio.id !== municipioId) {
      throw new BadRequestException(
        `La zona con ID ${zonaId} no pertenece al municipio con ID ${municipioId}`,
      );
    }
    return zona;
  }

  private async ensureEmailAvailable(
    email: string,
    excludeId?: number,
  ): Promise<void> {
    const trabajador = await this.trabajadorRepository.findOneBy({
      email: email.trim(),
    });
    if (trabajador && trabajador.id !== excludeId) {
      throw new ConflictException('El email ya está registrado para otro trabajador');
    }
  }

  private async ensureDocumentAvailable(
    numDoc: string,
    excludeId?: number,
  ): Promise<void> {
    const trabajador = await this.trabajadorRepository.findOneBy({
      numDoc: numDoc.trim(),
    });
    if (trabajador && trabajador.id !== excludeId) {
      throw new ConflictException(
        'El número de documento ya está registrado para otro trabajador',
      );
    }
  }
}
