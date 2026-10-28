import { IsDateString, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { EstadoPortafolio } from '../entities/portafolio.entity';

export class CreatePortafolioDto {
  @IsString({ message: 'El nombre del oficio debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del oficio es obligatorio' })
  @Length(1, 30, { message: 'El nombre del oficio debe tener máximo 30 caracteres' })
  nombreOficio: string;

  @IsString({ message: 'La categoría debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  @Length(1, 50, { message: 'La categoría debe tener máximo 50 caracteres' })
  categoria: string;

  @IsDateString({}, { message: 'La fecha debe tener un formato de fecha válido' })
  fechaHora: string;

  @IsEnum(EstadoPortafolio, { message: 'El estado debe ser activo o inactivo' })
  estado: EstadoPortafolio;

  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @Length(1, 200, { message: 'La descripción debe tener máximo 200 caracteres' })
  descripcion: string;
}