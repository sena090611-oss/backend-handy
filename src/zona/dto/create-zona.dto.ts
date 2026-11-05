import { IsInt, IsNotEmpty, IsString, Length, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateZonaDto {
  @ApiProperty({ example: 'La Castellana' })
  @IsString({ message: 'El nombre de la zona debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la zona es obligatorio' })
  @Length(1, 45, { message: 'El nombre de la zona debe tener máximo 45 caracteres' })
  nombre: string;

  @ApiProperty({ example: 1, description: 'ID del municipio al que pertenece la zona' })
  @IsInt({ message: 'El ID del municipio debe ser un número entero' })
  @Min(1, { message: 'El ID del municipio debe ser mayor que cero' })
  municipioId: number;
}
