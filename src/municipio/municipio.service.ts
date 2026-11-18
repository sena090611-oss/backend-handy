/**
 * Servicio de municipios.
 * Gestiona creación, consulta y validación de municipios.
 *
 * Nota: la carga inicial de municipios (departamento de Córdoba, Colombia)
 * NO se hace aquí; se hace con el script `npm run seed` leyendo
 * src/seed/municipios.json, para que la data base provenga de un único
 * archivo configurable y no de una lista hardcodeada en el código.
 */
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Municipio } from './entities/municipio.entity';
import { CreateMunicipioDto } from './dto/create-municipios.dto';
import { UpdateMunicipioDto } from './dto/update-municipio.dto';
// New imports for counting workers
import { UserRole } from '../user/entities/user.entity';
import { Trabajador } from '../trabajador/entities/trabajador.entity';




@Injectable()
export class MunicipioService {
  constructor(
    @InjectRepository(Municipio)
    private readonly municipioRepository: Repository<Municipio>,
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
  ) {}

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
   * La ocupación se filtra por el oficio asociado a la ficha del trabajador.
   */
  async countWorkers(
    municipioId: number,
    occupation?: string,
  ): Promise<number> {
    // Verificamos que el municipio exista primero
    await this.findOne(municipioId);

    const query = this.trabajadorRepository
      .createQueryBuilder('trabajador')
      .innerJoin('trabajador.usuario', 'usuario')
      .where('usuario.role = :role', { role: UserRole.TRABAJADOR })
      .andWhere('trabajador.id_municipio = :municipioId', { municipioId });

    const ocupacion = occupation?.trim();
    if (ocupacion) {
      query
        .innerJoin('trabajador.detallesPortafolio', 'detalle')
        .innerJoin('detalle.portafolio', 'portafolio')
        .andWhere('portafolio.nombreOficio LIKE :occupation', {
          occupation: `%${ocupacion}%`,
        })
        .distinct(true);
    }

    return query.getCount();
  }

  async remove(id: number): Promise<void> {
    const municipio = await this.findOne(id);
    await this.municipioRepository.remove(municipio);
  }
}