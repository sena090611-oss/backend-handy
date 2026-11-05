import { PartialType, PickType } from '@nestjs/swagger';
import { CreateDisponibilidadDto } from './create-disponibilidad.dto';

export class UpdateDisponibilidadDto extends PartialType(
  PickType(CreateDisponibilidadDto, ['jornada'] as const),
) {}
