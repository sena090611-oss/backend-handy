import { ApiProperty } from '@nestjs/swagger';
import { Jornada } from '../../disponibilidad/entities/disponibilidad.entity';
import { TrabajadorPublicoDto } from './trabajador-publico.dto';

export class TrabajadorBusquedaDto extends TrabajadorPublicoDto {
  @ApiProperty({ enum: Jornada, isArray: true })
  jornadas: Jornada[];
}

export class TrabajadoresPaginadosDto {
  @ApiProperty({ type: [TrabajadorBusquedaDto] })
  data: TrabajadorBusquedaDto[];

  @ApiProperty({ example: 27 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;
}
