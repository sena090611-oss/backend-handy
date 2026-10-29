import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

/**
 * DTO para crear una calificación.
 * La puntuación debe estar entre 1 y 5. El comentario es opcional.
 * Se incluye el identificador de la solicitud que será calificada.
 */
export class CreateCalificacionDto {
  @IsInt()
  @Min(1)
  @Max(5)
  puntuacion: number;

  @IsOptional()
  @IsString()
  comentario?: string;

  @IsInt()
  solicitudId: number;
}
