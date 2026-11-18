/**
 * Mapper que convierte las entidades `SolicitudDeServicio` en DTOs de
 * respuesta seguros. Precarga promedios de calificación y oficios del
 * portafolio en bloque para evitar consultas N+1 al listar solicitudes.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Calificacion, CalificacionTipo } from '../calificacion/entities/calificacion.entity';
import { DetallePortafolio } from '../detalle_portafolio/detalle_portafolio/entities/detalle-portafolio.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { OficioPublicoDto } from '../trabajador/dto/trabajador-publico.dto';
import { TrabajadorContactoDto } from '../trabajador/dto/trabajador-contacto.dto';
import { UsuarioResumenDto } from '../user/dto/usuario-resumen.dto';
import { PortafolioResumenDto } from './dto/portafolio-resumen.dto';
import {
  EstadoSolicitud,
  SolicitudDeServicio,
} from './entities/solicitud-de-servicio.entity';
import { SolicitudResponseDto } from './dto/solicitud-response.dto';

// Datos públicos precargados de los trabajadores involucrados.
interface DatosPublicosTrabajador {
  promedios: Map<number, number>;
  oficios: Map<number, OficioPublicoDto[]>;
}

@Injectable()
export class SolicitudResponseMapper {
  constructor(
    @InjectRepository(Calificacion)
    private readonly calificacionRepository: Repository<Calificacion>,
    @InjectRepository(DetallePortafolio)
    private readonly detalleRepository: Repository<DetallePortafolio>,
  ) {}

  /** Mapea una solicitud a su DTO de respuesta. */
  async toResponse(
    solicitud: SolicitudDeServicio,
    viewer: User,
  ): Promise<SolicitudResponseDto> {
    // Precargamos los datos públicos solo del trabajador involucrado (si hay).
    const datos = await this.cargarDatosPublicos(
      solicitud.trabajador ? [solicitud.trabajador.id] : [],
    );
    return this.mapear(solicitud, viewer, datos);
  }

  /** Mapea una lista de solicitudes a DTOs de respuesta. */
  async toResponseList(
    solicitudes: SolicitudDeServicio[],
    viewer: User,
  ): Promise<SolicitudResponseDto[]> {
    // Reunimos los IDs de todos los trabajadores involucrados (sin repetir).
    const idsTrabajadores = [
      ...new Set(
        solicitudes
          .map((solicitud) => solicitud.trabajador?.id)
          .filter((id): id is number => id !== undefined),
      ),
    ];
    const datos = await this.cargarDatosPublicos(idsTrabajadores);
    return Promise.all(
      solicitudes.map((solicitud) => this.mapear(solicitud, viewer, datos)),
    );
  }

  /** Convierte una entidad SolicitudDeServicio en DTO de respuesta. */
  private mapear(
    solicitud: SolicitudDeServicio,
    viewer: User,
    datos: DatosPublicosTrabajador,
  ): SolicitudResponseDto {
    const dto = new SolicitudResponseDto();
    dto.id = solicitud.id;
    dto.descripcion = solicitud.descripcion;
    dto.estado = solicitud.estado;
    dto.direccionServicio = solicitud.direccionServicio;
    dto.fechaServicio = solicitud.fechaServicio ?? null;
    dto.portafolio = solicitud.portafolio
      ? {
          id: solicitud.portafolio.id,
          nombreOficio: solicitud.portafolio.nombreOficio,
          categoria: solicitud.portafolio.categoria,
        }
      : null;
    dto.fechaCreacion = solicitud.fechaCreacion;
    dto.usuario = this.toUsuarioResumen(solicitud.usuario);
    dto.trabajador = solicitud.trabajador
      ? this.toTrabajadorPublico(
          solicitud,
          viewer,
          datos,
        )
      : null;
    return dto;
  }

  /** Resumen del cliente dueño: solo id y nombre completo. */
  private toUsuarioResumen(usuario: User): UsuarioResumenDto {
    return {
      id: usuario.id,
      fullName: usuario.fullName,
    };
  }

  /**
   * Información pública del trabajador asignado.
   * El teléfono solo se incluye si el solicitante tiene derecho al contacto:
   * admin, el propio trabajador asignado, o el cliente dueño de una solicitud
   * ya aceptada (con trabajador asignado).
   */
  private toTrabajadorPublico(
    solicitud: SolicitudDeServicio,
    viewer: User,
    datos: DatosPublicosTrabajador,
  ): TrabajadorContactoDto {
    const trabajador = solicitud.trabajador as NonNullable<
      SolicitudDeServicio['trabajador']
    >;
    const dto = new TrabajadorContactoDto();
    dto.id = trabajador.id;
    dto.nombres = trabajador.nombres;
    dto.apellidoInicial = `${trabajador.apellidos.charAt(0)}.`;
    dto.foto = trabajador.foto;
    dto.nivelFormacion = trabajador.nivelFormacion;
    dto.municipio = trabajador.municipio?.nombre ?? null;
    dto.zona = trabajador.zona?.nombre ?? null;
    dto.promedioCalificacion = datos.promedios.get(trabajador.id) ?? 0;
    dto.oficios = datos.oficios.get(trabajador.id) ?? [];
    dto.telefono = this.debeIncluirContacto(solicitud, viewer)
      ? trabajador.telefono
      : null;
    return dto;
  }

  /** Regla de visibilidad del teléfono de contacto del trabajador. */
  private debeIncluirContacto(
    solicitud: SolicitudDeServicio,
    viewer: User,
  ): boolean {
    // El admin puede ver todos los campos.
    if (viewer.role === UserRole.ADMIN) {
      return true;
    }
    // El propio trabajador asignado ve su teléfono.
    if (solicitud.trabajador?.usuario?.id === viewer.id) {
      return true;
    }
    // El cliente ve el contacto desde que el trabajador acepta la solicitud.
    return (
      solicitud.usuario?.id === viewer.id &&
      !!solicitud.trabajador &&
      [
        EstadoSolicitud.ACEPTADA,
        EstadoSolicitud.EN_CURSO,
        EstadoSolicitud.COMPLETADA,
      ].includes(solicitud.estado)
    );
  }

  /**
   * Precarga en bloque promedios de calificación y oficios de portafolio para
   * un conjunto de trabajadores. Evita consultas por cada solicitud.
   */
  private async cargarDatosPublicos(
    idsTrabajadores: number[],
  ): Promise<DatosPublicosTrabajador> {
    if (idsTrabajadores.length === 0) {
      return { promedios: new Map(), oficios: new Map() };
    }

    // Promedio de calificaciones de cliente a trabajador, agrupado por ficha.
    const filas = await this.calificacionRepository
      .createQueryBuilder('calif')
      .innerJoin('calif.solicitud', 'sol')
      .select('sol.id_trabajador', 'trabajadorId')
      .addSelect('AVG(calif.puntuacion)', 'promedio')
      .where('sol.id_trabajador IN (:...ids)', { ids: idsTrabajadores })
      .andWhere('calif.tipo = :tipo', {
        tipo: CalificacionTipo.CLIENTE_A_TRABAJADOR,
      })
      .groupBy('sol.id_trabajador')
      .getRawMany<{ trabajadorId: string; promedio: string | number }>();

    const promedios = new Map<number, number>();
    for (const fila of filas) {
      const promedio = Number(fila.promedio) || 0;
      // Redondeamos a un decimal para la respuesta.
      promedios.set(Number(fila.trabajadorId), Math.round(promedio * 10) / 10);
    }

    // Oficios del portafolio de cada trabajador.
    const detalles = await this.detalleRepository.find({
      where: { trabajador: { id: In(idsTrabajadores) } },
      relations: { portafolio: true },
    });
    const oficios = new Map<number, OficioPublicoDto[]>();
    for (const detalle of detalles) {
      const lista = oficios.get(detalle.trabajador.id) ?? [];
      lista.push({
        id: detalle.id,
        nombreOficio: detalle.portafolio.nombreOficio,
        categoria: detalle.portafolio.categoria,
        descripcionTrabajos: detalle.descripcionTrabajos,
        aniosExperiencia: detalle.aniosExperiencia,
      });
      oficios.set(detalle.trabajador.id, lista);
    }

    return { promedios, oficios };
  }
}
