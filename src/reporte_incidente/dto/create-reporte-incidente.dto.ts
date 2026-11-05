import { IsNotEmpty, IsString, IsEnum, IsInt, IsOptional, MaxLength } from 'class-validator';
import { EstadoReporte } from '../enums/estado-reporte.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReporteIncidenteDto {
  @ApiProperty({ example: 'El trabajador no se presentó en el horario acordado.' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  descripcion: string;

  @ApiPropertyOptional({ enum: EstadoReporte, example: EstadoReporte.ABIERTO })
  @IsOptional()
  @IsEnum(EstadoReporte)
  estado?: EstadoReporte;

  @ApiProperty({ example: 12, description: 'ID de la solicitud relacionada' })
  @IsNotEmpty()
  @IsInt()
  solicitudId: number;

  @ApiPropertyOptional({ example: 'María Pérez' })
  @IsOptional()
  @IsString()
  reportadoPor?: string;
}
