import { ApiPropertyOptional } from '@nestjs/swagger';
import { TrabajadorPublicoDto } from './trabajador-publico.dto';

export class TrabajadorContactoDto extends TrabajadorPublicoDto {
  @ApiPropertyOptional({ example: null, nullable: true })
  telefono: string | null;
}
