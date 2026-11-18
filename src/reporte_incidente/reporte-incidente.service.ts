/**
 * Servicio de reportes de incidentes.
 * Gestiona la creación, validación, filtros y eliminación de reportes de servicio.
 */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { ReporteIncidente } from './entities/reporte-incidente.entity';
import { CreateReporteIncidenteDto } from './dto/create-reporte-incidente.dto';
import { UpdateReporteIncidenteDto } from './dto/update-reporte-incidente.dto';
import { FilterReporteIncidenteDto } from './dto/filter-reporte-incidente.dto';
import { ReporteIncidenteResponseDto } from './dto/reporte-incidente-response.dto';
import { SolicitudDeServicio } from '../solicitud_de_servicio/entities/solicitud-de-servicio.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { EstadoReporte } from './enums/estado-reporte.enum';
import { UsuarioResumenDto } from '../user/dto/usuario-resumen.dto';

@Injectable()
export class ReporteIncidenteService {
  constructor(
    @InjectRepository(ReporteIncidente)
    private readonly reporteRepo: Repository<ReporteIncidente>,
    @InjectRepository(SolicitudDeServicio)
    private readonly solicitudRepo: Repository<SolicitudDeServicio>,
  ) {}

  /**
   * Crear un reporte de incidente sobre una solicitud en la que el usuario
   * autenticado participa (cliente dueño o trabajador asignado). El admin
   * puede gestionar reportes existentes, pero no crear reportes como tercero.
   * El autor y el estado inicial se derivan en el servidor.
   */
  async create(
    dto: CreateReporteIncidenteDto,
    usuario: User,
  ): Promise<ReporteIncidenteResponseDto> {
    const solicitud = await this.solicitudRepo.findOne({
      where: { id: dto.solicitudId },
      relations: { usuario: true, trabajador: { usuario: true } },
    });
    if (!solicitud) {
      throw new NotFoundException(
        `Solicitud con id ${dto.solicitudId} no encontrada`,
      );
    }
    // Solo los participantes de la solicitud (o un admin) pueden reportarla.
    this.verificarParticipacion(solicitud, usuario, false);
    const reporte = this.reporteRepo.create({
      descripcion: dto.descripcion,
      // El estado inicial siempre es ABIERTO, sin importar lo que envíe el cliente.
      estado: EstadoReporte.ABIERTO,
      solicitud,
      // El autor del reporte se toma del token JWT.
      reportadoPor: usuario,
    });
    return this.toResponseDto(await this.reporteRepo.save(reporte));
  }

  /**
   * Listar reportes aplicando filtros opcionales.
   * - admin: ve todos los reportes.
   * - cliente: solo los reportes de sus propias solicitudes.
   * - trabajador: solo los reportes de las solicitudes que tiene asignadas.
   */
  async findAll(
    filter: FilterReporteIncidenteDto | undefined,
    usuario: User,
  ): Promise<ReporteIncidenteResponseDto[]> {
    const where: FindOptionsWhere<ReporteIncidente> = {};
    const solicitudWhere: FindOptionsWhere<SolicitudDeServicio> = {};

    // Filtro por solicitud concreta. Si se indica una solicitud, validamos
    // primero que el usuario participe en ella para no filtrar datos ajenos.
    if (filter?.solicitudId !== undefined) {
      const solicitud = await this.solicitudRepo.findOne({
        where: { id: filter.solicitudId },
        relations: { usuario: true, trabajador: { usuario: true } },
      });
      if (!solicitud) {
        throw new NotFoundException(
          `Solicitud con id ${filter.solicitudId} no encontrada`,
        );
      }
      this.verificarParticipacion(solicitud, usuario);
      solicitudWhere.id = filter.solicitudId;
    }

    // Restricción de acceso según el rol del usuario autenticado.
    if (usuario.role === UserRole.CLIENTE) {
      solicitudWhere.usuario = { id: usuario.id };
    } else if (usuario.role === UserRole.TRABAJADOR) {
      solicitudWhere.trabajador = { usuario: { id: usuario.id } };
    }

    // Solo aplicamos la relación si hay alguna condición sobre la solicitud.
    if (Object.keys(solicitudWhere).length > 0) {
      where.solicitud = solicitudWhere;
    }

    if (filter?.estado) {
      where.estado = filter.estado;
    }

    // Filtros de fecha: funcionan juntos o por separado.
    if (filter?.fechaDesde && filter?.fechaHasta) {
      where.fechaCreacion = Between(
        new Date(filter.fechaDesde),
        new Date(filter.fechaHasta),
      );
    } else if (filter?.fechaDesde) {
      where.fechaCreacion = MoreThanOrEqual(new Date(filter.fechaDesde));
    } else if (filter?.fechaHasta) {
      where.fechaCreacion = LessThanOrEqual(new Date(filter.fechaHasta));
    }

    const reportes = await this.reporteRepo.find({
      where,
      relations: {
        solicitud: { usuario: true, trabajador: { usuario: true } },
        reportadoPor: true,
      },
    });
    return reportes.map((reporte) => this.toResponseDto(reporte));
  }

  /**
   * Obtener un reporte por su ID.
   * Solo pueden verlo el admin y los participantes de la solicitud asociada.
   */
  async findOne(id: number, usuario: User): Promise<ReporteIncidenteResponseDto> {
    const reporte = await this.buscarReporte(id);
    // Validamos que el usuario participe en la solicitud del reporte.
    this.verificarParticipacion(reporte.solicitud, usuario);
    return this.toResponseDto(reporte);
  }

  /**
   * Actualizar un reporte existente.
   * Solo un administrador o el autor del reporte (mientras esté ABIERTO)
   * pueden modificarlo. El estado solo lo cambia un administrador.
   */
  async update(
    id: number,
    dto: UpdateReporteIncidenteDto,
    usuario: User,
  ): Promise<ReporteIncidenteResponseDto> {
    const reporte = await this.buscarReporte(id);
    // Validamos que el usuario pueda gestionar este reporte.
    this.verificarGestionReporte(reporte, usuario);
    // El estado solo puede cambiarlo un administrador.
    if (dto.estado !== undefined) {
      if (usuario.role !== UserRole.ADMIN) {
        throw new ForbiddenException(
          'Solo un administrador puede cambiar el estado del reporte',
        );
      }
      reporte.estado = dto.estado;
    }
    // Actualizamos la descripción si se proporciona.
    if (dto.descripcion !== undefined) {
      reporte.descripcion = dto.descripcion;
    }
    return this.toResponseDto(await this.reporteRepo.save(reporte));
  }

  /**
   * Eliminar un reporte.
   * Solo un administrador o el autor del reporte (mientras esté ABIERTO)
   * pueden eliminarlo.
   */
  async remove(id: number, usuario: User): Promise<void> {
    const reporte = await this.buscarReporte(id);
    // Validamos que el usuario pueda gestionar este reporte.
    this.verificarGestionReporte(reporte, usuario);
    await this.reporteRepo.remove(reporte);
  }

  /**
   * Convierte un reporte en su DTO de respuesta, exponiendo del autor solo
   * id y fullName (nunca el objeto User completo).
   */
  private toResponseDto(reporte: ReporteIncidente): ReporteIncidenteResponseDto {
    const reportadoPor: UsuarioResumenDto | null = reporte.reportadoPor
      ? { id: reporte.reportadoPor.id, fullName: reporte.reportadoPor.fullName }
      : null;
    return {
      id: reporte.id,
      descripcion: reporte.descripcion,
      fechaCreacion: reporte.fechaCreacion,
      estado: reporte.estado,
      solicitudId: reporte.solicitud.id,
      reportadoPor,
    };
  }

  /**
   * Busca un reporte por su ID cargando las relaciones necesarias para
   * validar los permisos. Lanza 404 si no existe.
   */
  private async buscarReporte(id: number): Promise<ReporteIncidente> {
    const reporte = await this.reporteRepo.findOne({
      where: { id },
      relations: {
        solicitud: { usuario: true, trabajador: { usuario: true } },
        reportadoPor: true,
      },
    });
    if (!reporte) {
      throw new NotFoundException(`Reporte con id ${id} no encontrado`);
    }
    return reporte;
  }

  /**
   * Valida que el usuario participe en la solicitud: cliente dueño, trabajador
   * asignado o administrador.
   */
  private verificarParticipacion(
    solicitud: SolicitudDeServicio,
    usuario: User,
    adminPuedeAcceder = true,
  ): void {
    if (adminPuedeAcceder && usuario.role === UserRole.ADMIN) {
      return;
    }
    if (solicitud.usuario.id === usuario.id) {
      return;
    }
    if (solicitud.trabajador?.usuario.id === usuario.id) {
      return;
    }
    throw new ForbiddenException(
      'No tienes permisos para acceder a los reportes de esta solicitud',
    );
  }

  /**
   * Valida que el usuario pueda modificar o eliminar el reporte: debe ser
   * administrador o el autor mientras el reporte siga ABIERTO.
   */
  private verificarGestionReporte(
    reporte: ReporteIncidente,
    usuario: User,
  ): void {
    if (usuario.role === UserRole.ADMIN) {
      return;
    }
    if (
      reporte.reportadoPor?.id === usuario.id &&
      reporte.estado === EstadoReporte.ABIERTO
    ) {
      return;
    }
    throw new ForbiddenException(
      'Solo un administrador o el autor del reporte mientras esté ABIERTO puede gestionarlo',
    );
  }
}
