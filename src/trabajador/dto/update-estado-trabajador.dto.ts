import { IsEnum } from 'class-validator';
import { EstadoTrabajador } from '../entities/trabajador.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEstadoTrabajadorDto {
  @ApiProperty({ enum: EstadoTrabajador, example: EstadoTrabajador.ACTIVO })
  @IsEnum(EstadoTrabajador, { message: 'El estado del trabajador no es válido' })
  estado: EstadoTrabajador;
}
