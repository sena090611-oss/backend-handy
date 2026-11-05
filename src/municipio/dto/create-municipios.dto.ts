import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMunicipioDto {
  @ApiProperty({ example: 'Montería' })
  @IsString({ message: 'El municipio debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El municipio es obligatorio' })
  nombre: string;
}