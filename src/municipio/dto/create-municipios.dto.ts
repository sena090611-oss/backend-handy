import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMunicipioDto {
  @IsString({ message: 'El municipio debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El municipio es obligatorio' })
  nombre: string;
}