import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../user/entities/user.entity';
import { Portafolio } from '../../portafolio/entities/portafolio.entity';
import { Trabajador } from '../../trabajador/entities/trabajador.entity';
import { CreateDetallePortafolioDto } from './dto/create-detalle-portafolio.dto';
import { UpdateDetallePortafolioDto } from './dto/update-detalle-portafolio.dto';
import { DetallePortafolio } from './entities/detalle-portafolio.entity';

@Injectable()
export class DetallePortafolioService {
  constructor(
    @InjectRepository(DetallePortafolio)
    private readonly detalleRepository: Repository<DetallePortafolio>,
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
    @InjectRepository(Portafolio)
    private readonly portafolioRepository: Repository<Portafolio>,
  ) {}

  async create(
    dto: CreateDetallePortafolioDto,
    usuario: User,
  ): Promise<DetallePortafolio> {
    const trabajador = await this.findTrabajador(dto.trabajadorId);
    await this.ensureOwnTrabajador(trabajador.id, usuario);
    const portafolio = await this.findPortafolio(dto.portafolioId);
    await this.ensurePairAvailable(trabajador.id, portafolio.id);

    const detalle = this.detalleRepository.create({
      trabajador,
      portafolio,
      aniosExperiencia: dto.aniosExperiencia,
      descripcionTrabajos: dto.descripcionTrabajos,
    });
    return this.detalleRepository.save(detalle);
  }

  async findAll(usuario: User): Promise<DetallePortafolio[]> {
    const where =
      usuario.role === UserRole.ADMIN
        ? {}
        : { trabajador: { id: (await this.findTrabajadorByUser(usuario.id)).id } };

    return this.detalleRepository.find({
      where,
      relations: { trabajador: true, portafolio: true },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number, usuario: User): Promise<DetallePortafolio> {
    const detalle = await this.detalleRepository.findOne({
      where: { id },
      relations: { trabajador: true, portafolio: true },
    });
    if (!detalle) {
      throw new NotFoundException(
        `Detalle de portafolio con ID ${id} no encontrado`,
      );
    }

    await this.ensureOwnTrabajador(detalle.trabajador.id, usuario);
    return detalle;
  }

  async update(
    id: number,
    dto: UpdateDetallePortafolioDto,
    usuario: User,
  ): Promise<DetallePortafolio> {
    const detalle = await this.findOne(id, usuario);
    if (dto.aniosExperiencia !== undefined) {
      detalle.aniosExperiencia = dto.aniosExperiencia;
    }
    if (dto.descripcionTrabajos !== undefined) {
      detalle.descripcionTrabajos = dto.descripcionTrabajos;
    }
    return this.detalleRepository.save(detalle);
  }

  async remove(id: number, usuario: User): Promise<void> {
    const detalle = await this.findOne(id, usuario);
    await this.detalleRepository.remove(detalle);
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

  private async findPortafolio(id: number): Promise<Portafolio> {
    const portafolio = await this.portafolioRepository.findOneBy({ id });
    if (!portafolio) {
      throw new NotFoundException(`Portafolio con ID ${id} no encontrado`);
    }
    return portafolio;
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
        'Solo puedes gestionar tus propios detalles de portafolio',
      );
    }
  }

  private async ensurePairAvailable(
    trabajadorId: number,
    portafolioId: number,
  ): Promise<void> {
    const existente = await this.detalleRepository.findOneBy({
      trabajador: { id: trabajadorId },
      portafolio: { id: portafolioId },
    });
    if (existente) {
      throw new ConflictException(
        'El trabajador ya tiene un detalle para este portafolio',
      );
    }
  }
}
