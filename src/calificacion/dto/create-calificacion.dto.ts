import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para crear una calificación.
 * La puntuación debe estar entre 1 y 5. El comentario es opcional.
 * Se incluye el identificador de la solicitud que será calificada.
 */
export class CreateCalificacionDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  puntuacion: number;

  @ApiPropertyOptional({ example: 'El servicio fue puntual y de excelente calidad.' })
  @IsOptional()
  @IsString()
  comentario?: string;

  @ApiProperty({ example: 12, description: 'ID de una solicitud completada' })
  @IsInt()
  solicitudId: number;
}
