import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoReporte } from '../enums/estado-reporte.enum';

/**
 * DTO para actualizar un reporte de incidente.
 * La descripción puede modificarla el autor (mientras el reporte esté ABIERTO)
 * o un administrador. El estado solo lo puede cambiar un administrador.
 * No se permite cambiar la solicitud asociada ni el autor del reporte.
 */
export class UpdateReporteIncidenteDto {
  @ApiPropertyOptional({
    example: 'El trabajador no se presentó en el horario acordado.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  descripcion?: string;

  @ApiPropertyOptional({ enum: EstadoReporte, example: EstadoReporte.EN_REVISION })
  @IsOptional()
  @IsEnum(EstadoReporte)
  estado?: EstadoReporte;
}
