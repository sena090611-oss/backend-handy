import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateDisponibilidadDto } from './create-disponibilidad.dto';

export class UpdateDisponibilidadDto extends PartialType(
  PickType(CreateDisponibilidadDto, ['jornada'] as const),
) {}
