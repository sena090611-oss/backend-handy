import { IsInt, IsNotEmpty, IsString, Length, Min } from 'class-validator';

export class CreateZonaDto {
  @IsString({ message: 'El nombre de la zona debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la zona es obligatorio' })
  @Length(1, 45, { message: 'El nombre de la zona debe tener máximo 45 caracteres' })
  nombre: string;

  @IsInt({ message: 'El ID del municipio debe ser un número entero' })
  @Min(1, { message: 'El ID del municipio debe ser mayor que cero' })
  municipioId: number;
}
