import {
  ForbiddenException,
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Calificacion,
  CalificacionTipo,
} from './entities/calificacion.entity';
import { CreateCalificacionDto } from './dto/create-calificacion.dto';
import { SolicitudDeServicio } from '../solicitud_de_servicio/entities/solicitud-de-servicio.entity';
import { User, UserRole } from '../user/entities/user.entity';

/**
 * Servicio que maneja la lógica de negocio de las calificaciones.
 * Incluye creación, consulta por solicitud y cálculo del promedio por trabajador.
 */
@Injectable()
export class CalificacionService {
  constructor(
    @InjectRepository(Calificacion)
    private readonly calificacionRepository: Repository<Calificacion>,
    @InjectRepository(SolicitudDeServicio)
    private readonly solicitudRepository: Repository<SolicitudDeServicio>,
  ) {}

  /**
   * Crea una nueva calificación asociada a una solicitud existente.
   * Lanza NotFoundException si la solicitud no existe y ConflictException
   * si la solicitud ya tiene una calificación.
   */
  async createByCliente(
    dto: CreateCalificacionDto,
    usuario: User,
  ): Promise<Calificacion> {
    return this.create(dto, usuario, CalificacionTipo.CLIENTE_A_TRABAJADOR);
  }

  async createByTrabajador(
    dto: CreateCalificacionDto,
    usuario: User,
  ): Promise<Calificacion> {
    return this.create(dto, usuario, CalificacionTipo.TRABAJADOR_A_CLIENTE);
  }

  private async create(
    dto: CreateCalificacionDto,
    usuario: User,
    tipo: CalificacionTipo,
  ): Promise<Calificacion> {
    const solicitud = await this.solicitudRepository.findOne({
      where: { id: dto.solicitudId },
      relations: {
        usuario: true,
        trabajador: { usuario: true },
        calificaciones: true,
      },
    });
    if (!solicitud) {
      throw new NotFoundException(
        `Solicitud de servicio con ID ${dto.solicitudId} no encontrada`,
      );
    }
    if (tipo === CalificacionTipo.CLIENTE_A_TRABAJADOR) {
      if (
        usuario.role !== UserRole.CLIENTE ||
        solicitud.usuario.id !== usuario.id
      ) {
        throw new ForbiddenException(
          'Solo el cliente que creó la solicitud puede calificar al trabajador',
        );
      }
      if (!solicitud.trabajador) {
        throw new ConflictException(
          'La solicitud todavía no tiene un trabajador asignado',
        );
      }
    } else if (
      usuario.role !== UserRole.TRABAJADOR ||
      solicitud.trabajador?.usuario.id !== usuario.id
    ) {
      throw new ForbiddenException(
        'Solo el trabajador asignado a la solicitud puede calificar al cliente',
      );
    }

    if (solicitud.calificaciones?.some((calificacion) => calificacion.tipo === tipo)) {
      throw new ConflictException(
        `Ya existe una calificación de tipo ${tipo} para la solicitud con ID ${dto.solicitudId}`,
      );
    }
    const calificacion = this.calificacionRepository.create({
      puntuacion: dto.puntuacion,
      comentario: dto.comentario,
      tipo,
      solicitud,
    });
    return this.calificacionRepository.save(calificacion);
  }

  /** Obtiene las calificaciones asociadas a una solicitud */
  async findBySolicitud(solicitudId: number): Promise<Calificacion[]> {
    return this.calificacionRepository.find({
      where: { solicitud: { id: solicitudId } },
      order: { tipo: 'ASC' },
    });
  }

  /** Calcula el promedio de puntuaciones para un trabajador */
  async averageByTrabajador(trabajadorId: number): Promise<number> {
    const result = await this.calificacionRepository
      .createQueryBuilder('c')
      .innerJoin('c.solicitud', 's')
      .where('s.id_trabajador = :trabajadorId', { trabajadorId })
      .andWhere('c.tipo = :tipo', {
        tipo: CalificacionTipo.CLIENTE_A_TRABAJADOR,
      })
      .select('AVG(c.puntuacion)', 'avg')
      .getRawOne();
    return Number(result?.avg) || 0;
  }
}
