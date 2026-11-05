import { IsEnum, IsInt, Min } from 'class-validator';
import { Jornada } from '../entities/disponibilidad.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDisponibilidadDto {
  @ApiProperty({ example: 3, description: 'ID del trabajador' })
  @IsInt({ message: 'El ID del trabajador debe ser un número entero' })
  @Min(1, { message: 'El ID del trabajador debe ser mayor que cero' })
  trabajadorId: number;

  @ApiProperty({ enum: Jornada, example: Jornada.MANANA })
  @IsEnum(Jornada, { message: 'La jornada debe ser MAÑANA, TARDE o NOCHE' })
  jornada: Jornada;
}
