import { IsDateString, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { EstadoPortafolio } from '../entities/portafolio.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePortafolioDto {
  @ApiProperty({ example: 'Plomería' })
  @IsString({ message: 'El nombre del oficio debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del oficio es obligatorio' })
  @Length(1, 30, { message: 'El nombre del oficio debe tener máximo 30 caracteres' })
  nombreOficio: string;

  @ApiProperty({ example: 'Mantenimiento del hogar' })
  @IsString({ message: 'La categoría debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  @Length(1, 50, { message: 'La categoría debe tener máximo 50 caracteres' })
  categoria: string;

  @ApiProperty({ example: '2026-11-04', format: 'date' })
  @IsDateString({}, { message: 'La fecha debe tener un formato de fecha válido' })
  fechaHora: string;

  @ApiProperty({ enum: EstadoPortafolio, example: EstadoPortafolio.ACTIVO })
  @IsEnum(EstadoPortafolio, { message: 'El estado debe ser activo o inactivo' })
  estado: EstadoPortafolio;

  @ApiProperty({ example: 'Instalación y reparación de tuberías domésticas' })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @Length(1, 200, { message: 'La descripción debe tener máximo 200 caracteres' })
  descripcion: string;
}