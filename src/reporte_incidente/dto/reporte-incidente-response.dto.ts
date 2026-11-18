// DTO de respuesta para los reportes de incidentes. Reemplaza a la entidad en
// las respuestas HTTP para no exponer el objeto User completo (email,
// municipio, etc.) de quien reportó.
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoReporte } from '../enums/estado-reporte.enum';
import { UsuarioResumenDto } from '../../user/dto/usuario-resumen.dto';

export class ReporteIncidenteResponseDto {
  @ApiProperty({ example: 3 })
  id: number;

  @ApiProperty({ example: 'El trabajador no se presentó en el horario acordado.' })
  descripcion: string;

  @ApiProperty({ example: '2026-11-04T14:30:00.000Z', format: 'date-time' })
  fechaCreacion: Date;

  @ApiProperty({ enum: EstadoReporte, example: EstadoReporte.ABIERTO })
  estado: EstadoReporte;

  @ApiProperty({ example: 12, description: 'ID de la solicitud reportada' })
  solicitudId: number;

  // Resumen del usuario que reportó (id y nombre únicamente).
  @ApiPropertyOptional({ type: UsuarioResumenDto, nullable: true })
  reportadoPor: UsuarioResumenDto | null;
}
