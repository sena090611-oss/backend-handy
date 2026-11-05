import { IsInt, IsString, Length, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDetallePortafolioDto {
  @ApiProperty({ example: 3, description: 'ID del trabajador propietario' })
  @IsInt({ message: 'El ID del trabajador debe ser un número entero' })
  @Min(1, { message: 'El ID del trabajador debe ser mayor que cero' })
  trabajadorId: number;

  @ApiProperty({ example: 2, description: 'ID del oficio en el portafolio' })
  @IsInt({ message: 'El ID del portafolio debe ser un número entero' })
  @Min(1, { message: 'El ID del portafolio debe ser mayor que cero' })
  portafolioId: number;

  @ApiProperty({ example: 5, minimum: 0, maximum: 60 })
  @IsInt({ message: 'Los años de experiencia deben ser un número entero' })
  @Min(0, { message: 'Los años de experiencia no pueden ser negativos' })
  @Max(60, { message: 'Los años de experiencia no pueden superar 60' })
  aniosExperiencia: number;

  @ApiProperty({ example: 'Instalación de griferías y reparación de tuberías.' })
  @IsString({ message: 'La descripción de trabajos debe ser texto' })
  @Length(1, 200, {
    message: 'La descripción de trabajos debe tener entre 1 y 200 caracteres',
  })
  descripcionTrabajos: string;
}
