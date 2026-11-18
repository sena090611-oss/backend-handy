import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateTrabajadorDto } from './create-trabajador.dto';

export class UpdateTrabajadorPropioDto extends PartialType(
  OmitType(CreateTrabajadorDto, ['usuarioId', 'numDoc'] as const),
) {}
