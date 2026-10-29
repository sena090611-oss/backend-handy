import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Calificacion } from './entities/calificacion.entity';
import { CreateCalificacionDto } from './dto/create-calificacion.dto';
import { SolicitudDeServicio } from '../solicitud_de_servicio/entities/solicitud-de-servicio.entity';

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
  async create(dto: CreateCalificacionDto): Promise<Calificacion> {
    const solicitud = await this.solicitudRepository.findOne({
      where: { id: dto.solicitudId },
      relations: { calificacion: true },
    });
    if (!solicitud) {
      throw new NotFoundException(
        `Solicitud de servicio con ID ${dto.solicitudId} no encontrada`,
      );
    }
    if (solicitud.calificacion) {
      throw new ConflictException(
        `La solicitud con ID ${dto.solicitudId} ya tiene una calificación`,
      );
    }
    const calificacion = this.calificacionRepository.create({
      puntuacion: dto.puntuacion,
      comentario: dto.comentario,
      solicitud,
    });
    return this.calificacionRepository.save(calificacion);
  }

  /** Obtiene la calificación asociada a una solicitud */
  async findBySolicitud(solicitudId: number): Promise<Calificacion | null> {
    return this.calificacionRepository.findOne({
      where: { solicitud: { id: solicitudId } },
    });
  }

  /** Calcula el promedio de puntuaciones para un trabajador */
  async averageByTrabajador(trabajadorId: number): Promise<number> {
    const result = await this.calificacionRepository
      .createQueryBuilder('c')
      .innerJoin('c.solicitud', 's')
      .where('s.id_trabajador = :trabajadorId', { trabajadorId })
      .select('AVG(c.puntuacion)', 'avg')
      .getRawOne();
    return Number(result?.avg) || 0;
  }
}
