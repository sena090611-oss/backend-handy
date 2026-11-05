import { PartialType } from '@nestjs/swagger';
import { CreateMunicipioDto } from './create-municipios.dto';

export class UpdateMunicipioDto extends PartialType(CreateMunicipioDto) {}
