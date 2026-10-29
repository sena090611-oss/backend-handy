import { IsEnum, IsInt, Min } from 'class-validator';
import { Jornada } from '../entities/disponibilidad.entity';

export class CreateDisponibilidadDto {
  @IsInt({ message: 'El ID del trabajador debe ser un número entero' })
  @Min(1, { message: 'El ID del trabajador debe ser mayor que cero' })
  trabajadorId: number;

  @IsEnum(Jornada, { message: 'La jornada debe ser MAÑANA, TARDE o NOCHE' })
  jornada: Jornada;
}
