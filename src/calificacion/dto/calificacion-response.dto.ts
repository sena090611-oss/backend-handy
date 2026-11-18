import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CalificacionTipo } from '../entities/calificacion.entity';

export class CalificacionResponseDto {
  @ApiProperty({ example: 9 })
  id: number;

  @ApiProperty({ example: 12 })
  solicitudId: number;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  puntuacion: number;

  @ApiPropertyOptional({ example: 'Excelente servicio', nullable: true })
  comentario: string | null;

  @ApiProperty({ enum: CalificacionTipo })
  tipo: CalificacionTipo;

  @ApiProperty({ example: '2026-11-04T14:30:00.000Z', format: 'date-time' })
  fecha: Date;
}
