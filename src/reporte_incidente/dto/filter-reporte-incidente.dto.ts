import { IsOptional, IsInt, IsEnum, IsDateString } from 'class-validator';
import { EstadoReporte } from '../enums/estado-reporte.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterReporteIncidenteDto {
  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  solicitudId?: number;

  @ApiPropertyOptional({ enum: EstadoReporte, example: EstadoReporte.ABIERTO })
  @IsOptional()
  @IsEnum(EstadoReporte)
  estado?: EstadoReporte;

  @ApiPropertyOptional({ example: '2026-11-01', format: 'date' })
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @ApiPropertyOptional({ example: '2026-11-30', format: 'date' })
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;
}
