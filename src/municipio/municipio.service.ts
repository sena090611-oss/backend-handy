import {
  Injectable,
  ConflictException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MUNICIPIOS_INICIALES,
  Municipio,
} from './entities/municipio.entity';
import { CreateMunicipioDto } from './dto/create-municipios.dto';
import { UpdateMunicipioDto } from './dto/update-municipio.dto';
// New imports for counting workers
import { User, UserRole } from '../user/entities/user.entity';




@Injectable()
export class MunicipioService implements OnModuleInit {
  constructor(
    @InjectRepository(Municipio)
    private readonly municipioRepository: Repository<Municipio>,
    // Repository for Users to count workers per municipio
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit(): Promise<void> {
    const municipiosExistentes = await this.municipioRepository.find({
      select: { id: true },
    });
    const idsExistentes = new Set(municipiosExistentes.map(({ id }) => id));
    const municipiosPendientes = MUNICIPIOS_INICIALES.filter(
      ({ id }) => !idsExistentes.has(id),
    );

    if (municipiosPendientes.length > 0) {
      await this.municipioRepository.insert(municipiosPendientes);
    }
  }

  async create(createMunicipioDto: CreateMunicipioDto): Promise<Municipio> {
    const nombre = createMunicipioDto.nombre.trim();
    const municipioExistente = await this.municipioRepository.findOneBy({ nombre });
    if (municipioExistente) {
      throw new ConflictException(`El municipio "${nombre}" ya existe`);
    }
    return this.municipioRepository.save(this.municipioRepository.create({ nombre }));
  }

  async findAll(): Promise<Municipio[]> {
    return this.municipioRepository.find({ order: { nombre: 'ASC' } });
  }

  async findOne(id: number): Promise<Municipio> {
    const municipio = await this.municipioRepository.findOneBy({ id });
    if (!municipio) {
      throw new NotFoundException(`Municipio con ID ${id} no encontrado`);
    }
    return municipio;
  }

  async update(id: number, updateMunicipioDto: UpdateMunicipioDto): Promise<Municipio> {
    const municipio = await this.findOne(id);
    const nombre = updateMunicipioDto.nombre?.trim();
    if (nombre && nombre !== municipio.nombre) {
      const municipioExistente = await this.municipioRepository.findOneBy({ nombre });
      if (municipioExistente) {
        throw new ConflictException(`El municipio "${nombre}" ya existe`);
      }
      municipio.nombre = nombre;
    }
    return this.municipioRepository.save(municipio);
  }

  /**
   * Devuelve la cantidad de usuarios con rol TRABAJADOR que pertenecen al municipio
   * especificado. Opcionalmente puede filtrarse por una ocupación (nombre de oficio).
   *
   * Nota: la entidad `Portafolio` no tiene relación directa con `User` en el código
   * actual, por lo que la filtración por ocupación no está implementada. En ese
   * caso se ignora el parámetro `occupation` y se devuelve el total de trabajadores.
   */
  async countWorkers(
    municipioId: number,
    occupation?: string,
  ): Promise<number> {
    // Verificamos que el municipio exista primero
    await this.findOne(municipioId);

    const qb = this.userRepository.createQueryBuilder('user');
    qb.where('user.role = :role', { role: UserRole.TRABAJADOR })
      .andWhere('user.id_municipio = :municipioId', { municipioId });

    // Si en el futuro se agrega una relación entre User y Portafolio, aquí se
    // podría agregar un join y filtro por `nombreOficio`.
    if (occupation) {
      // Placeholder: actualmente la ocupación no está modelada, así que simplemente ignoramos.
    }

    const count = await qb.getCount();
    return count;
  }

  async remove(id: number): Promise<void> {
    const municipio = await this.findOne(id);
    await this.municipioRepository.remove(municipio);
  }
}