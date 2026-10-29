import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../user/entities/user.entity';
import { Trabajador } from '../trabajador/entities/trabajador.entity';
import { CreateDisponibilidadDto } from './dto/create-disponibilidad.dto';
import { UpdateDisponibilidadDto } from './dto/update-disponibilidad.dto';
import { Disponibilidad } from './entities/disponibilidad.entity';

@Injectable()
export class DisponibilidadService {
  constructor(
    @InjectRepository(Disponibilidad)
    private readonly disponibilidadRepository: Repository<Disponibilidad>,
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
  ) {}

  async create(
    dto: CreateDisponibilidadDto,
    usuario: User,
  ): Promise<Disponibilidad> {
    const trabajador = await this.findTrabajador(dto.trabajadorId);
    await this.ensureOwnTrabajador(trabajador.id, usuario);
    await this.ensureJornadaAvailable(trabajador.id, dto.jornada);

    const disponibilidad = this.disponibilidadRepository.create({
      trabajador,
      jornada: dto.jornada,
    });
    return this.disponibilidadRepository.save(disponibilidad);
  }

  async findAll(usuario: User): Promise<Disponibilidad[]> {
    if (usuario.role === UserRole.ADMIN) {
      return this.disponibilidadRepository.find({
        relations: { trabajador: true },
        order: { id: 'ASC' },
      });
    }

    const trabajador = await this.findTrabajadorByUser(usuario.id);
    return this.disponibilidadRepository.find({
      where: { trabajador: { id: trabajador.id } },
      relations: { trabajador: true },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number, usuario: User): Promise<Disponibilidad> {
    const disponibilidad = await this.disponibilidadRepository.findOne({
      where: { id },
      relations: { trabajador: true },
    });
    if (!disponibilidad) {
      throw new NotFoundException(`Disponibilidad con ID ${id} no encontrada`);
    }

    await this.ensureOwnTrabajador(disponibilidad.trabajador.id, usuario);
    return disponibilidad;
  }

  async update(
    id: number,
    dto: UpdateDisponibilidadDto,
    usuario: User,
  ): Promise<Disponibilidad> {
    const disponibilidad = await this.findOne(id, usuario);
    if (dto.jornada !== undefined && dto.jornada !== disponibilidad.jornada) {
      await this.ensureJornadaAvailable(
        disponibilidad.trabajador.id,
        dto.jornada,
      );
      disponibilidad.jornada = dto.jornada;
    }
    return this.disponibilidadRepository.save(disponibilidad);
  }

  async remove(id: number, usuario: User): Promise<void> {
    const disponibilidad = await this.findOne(id, usuario);
    await this.disponibilidadRepository.remove(disponibilidad);
  }

  private async findTrabajador(id: number): Promise<Trabajador> {
    const trabajador = await this.trabajadorRepository.findOneBy({ id });
    if (!trabajador) {
      throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
    }
    return trabajador;
  }

  private async findTrabajadorByUser(userId: number): Promise<Trabajador> {
    const trabajador = await this.trabajadorRepository.findOneBy({
      usuario: { id: userId },
    });
    if (!trabajador) {
      throw new NotFoundException(
        `No hay una ficha de trabajador para el usuario con ID ${userId}`,
      );
    }
    return trabajador;
  }

  private async ensureOwnTrabajador(
    trabajadorId: number,
    usuario: User,
  ): Promise<void> {
    if (usuario.role === UserRole.ADMIN) {
      return;
    }

    const esPropietario = await this.trabajadorRepository.existsBy({
      id: trabajadorId,
      usuario: { id: usuario.id },
    });
    if (!esPropietario) {
      throw new ForbiddenException(
        'Solo puedes gestionar tu propia disponibilidad',
      );
    }
  }

  private async ensureJornadaAvailable(
    trabajadorId: number,
    jornada: CreateDisponibilidadDto['jornada'],
  ): Promise<void> {
    const existente = await this.disponibilidadRepository.findOneBy({
      trabajador: { id: trabajadorId },
      jornada,
    });
    if (existente) {
      throw new ConflictException(
        `El trabajador ya tiene registrada la jornada ${jornada}`,
      );
    }
  }
}
