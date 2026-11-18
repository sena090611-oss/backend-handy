import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Jornada } from '../../disponibilidad/entities/disponibilidad.entity';
import { TrabajadorPublicoDto } from './trabajador-publico.dto';

export class ResenaPublicaDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  puntuacion: number;

  @ApiPropertyOptional({ example: 'Excelente servicio', nullable: true })
  comentario: string | null;

  @ApiProperty({ example: '2026-11-04T14:30:00.000Z', format: 'date-time' })
  fecha: Date;
}

export class TrabajadorPerfilPublicoDto extends TrabajadorPublicoDto {
  @ApiProperty({ enum: Jornada, isArray: true })
  jornadas: Jornada[];

  @ApiProperty({ type: [ResenaPublicaDto] })
  resenas: ResenaPublicaDto[];
}
