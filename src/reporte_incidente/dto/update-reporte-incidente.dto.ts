import { PartialType } from '@nestjs/swagger';
import { CreateReporteIncidenteDto } from './create-reporte-incidente.dto';

export class UpdateReporteIncidenteDto extends PartialType(CreateReporteIncidenteDto) {}
