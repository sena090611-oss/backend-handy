import { PartialType, PickType } from '@nestjs/swagger';
import { CreateDetallePortafolioDto } from './create-detalle-portafolio.dto';

export class UpdateDetallePortafolioDto extends PartialType(
  PickType(CreateDetallePortafolioDto, [
    'aniosExperiencia',
    'descripcionTrabajos',
  ] as const),
) {}
