import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateTrabajadorDto } from './create-trabajador.dto';

export class UpdateTrabajadorDto extends PartialType(
  OmitType(CreateTrabajadorDto, ['usuarioId'] as const),
) {}
