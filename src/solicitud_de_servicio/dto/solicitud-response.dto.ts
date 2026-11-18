// DTO de respuesta para las solicitudes de servicio. Reemplaza a la entidad
// en las respuestas HTTP para no exponer datos personales de usuario,
// trabajador ni contacto.
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UsuarioResumenDto } from '../../user/dto/usuario-resumen.dto';
import { TrabajadorContactoDto } from '../../trabajador/dto/trabajador-contacto.dto';
import { EstadoSolicitud } from '../entities/solicitud-de-servicio.entity';
import { PortafolioResumenDto } from './portafolio-resumen.dto';

export class SolicitudResponseDto {
  @ApiProperty({ example: 12 })
  id: number;

  @ApiProperty({ example: 'Necesito reparar una fuga en la cocina.' })
  descripcion: string;

  @ApiProperty({ enum: EstadoSolicitud, example: EstadoSolicitud.PENDIENTE })
  estado: EstadoSolicitud;

  @ApiProperty({
    example: 'Calle 45 # 23-10, Barrio Centro',
    nullable: true,
  })
  direccionServicio: string | null;

  @ApiProperty({
    example: '2026-11-25T10:00:00.000Z',
    format: 'date-time',
    nullable: true,
  })
  fechaServicio: Date | null;

  // Oficio solicitado (información pública del portafolio). Puede ser null
  // en registros anteriores a la migración de estados/datos del servicio.
  @ApiPropertyOptional({ type: PortafolioResumenDto, nullable: true })
  portafolio: PortafolioResumenDto | null;

  @ApiProperty({ example: '2026-11-04T14:30:00.000Z', format: 'date-time' })
  fechaCreacion: Date;

  // Resumen del cliente dueño de la solicitud (id y nombre únicamente).
  @ApiProperty({ type: UsuarioResumenDto })
  usuario: UsuarioResumenDto;

  // Información pública del trabajador asignado (null si aún no hay uno).
  @ApiPropertyOptional({ type: TrabajadorContactoDto, nullable: true })
  trabajador: TrabajadorContactoDto | null;
}
