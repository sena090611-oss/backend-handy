import { PartialType } from '@nestjs/mapped-types';
import { CreateMunicipioDto } from './create-municipios.dto';

export class UpdateMunicipioDto extends PartialType(CreateMunicipioDto) {}
