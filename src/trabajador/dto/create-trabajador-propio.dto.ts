import { OmitType } from '@nestjs/swagger';
import { CreateTrabajadorDto } from './create-trabajador.dto';

export class CreateTrabajadorPropioDto extends OmitType(
  CreateTrabajadorDto,
  ['usuarioId'] as const,
) {}
