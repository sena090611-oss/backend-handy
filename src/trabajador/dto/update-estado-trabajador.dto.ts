import { IsEnum } from 'class-validator';
import { EstadoTrabajador } from '../entities/trabajador.entity';

export class UpdateEstadoTrabajadorDto {
  @IsEnum(EstadoTrabajador, { message: 'El estado del trabajador no es válido' })
  estado: EstadoTrabajador;
}
