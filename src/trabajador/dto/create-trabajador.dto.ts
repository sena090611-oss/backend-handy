import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import {
  NivelFormacion,
  TipoDocumento,
} from '../entities/trabajador.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTrabajadorDto {
  @ApiProperty({ example: 8, description: 'ID de un usuario con rol trabajador' })
  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @Min(1, { message: 'El ID del usuario debe ser mayor que cero' })
  usuarioId: number;

  @ApiProperty({ example: 2 })
  @IsInt({ message: 'El ID de la zona debe ser un número entero' })
  @Min(1, { message: 'El ID de la zona debe ser mayor que cero' })
  zonaId: number;

  @ApiProperty({ example: 1 })
  @IsInt({ message: 'El ID del municipio debe ser un número entero' })
  @Min(1, { message: 'El ID del municipio debe ser mayor que cero' })
  municipioId: number;

  @ApiProperty({ enum: TipoDocumento, example: TipoDocumento.CC })
  @IsEnum(TipoDocumento, { message: 'El tipo de documento no es válido' })
  tipoDoc: TipoDocumento;

  @ApiProperty({ example: '1234567890' })
  @IsString({ message: 'El número de documento debe ser texto' })
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  numDoc: string;

  @ApiProperty({ example: 'Juan' })
  @IsString({ message: 'Los nombres deben ser texto' })
  @IsNotEmpty({ message: 'Los nombres son obligatorios' })
  nombres: string;

  @ApiProperty({ example: 'Gómez' })
  @IsString({ message: 'Los apellidos deben ser texto' })
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  apellidos: string;

  @ApiProperty({ example: 'Calle 10 # 5-20' })
  @IsString({ message: 'La dirección debe ser texto' })
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  direccion: string;

  @ApiProperty({ example: 'juan.gomez@handy.com' })
  @IsEmail({}, { message: 'El email debe ser válido' })
  email: string;

  @ApiProperty({ example: '3001234567', maxLength: 10 })
  @IsString({ message: 'El teléfono debe ser texto' })
  @Length(1, 10, { message: 'El teléfono debe tener máximo 10 caracteres' })
  telefono: string;

  @ApiPropertyOptional({ example: 'https://example.com/foto.jpg' })
  @IsOptional()
  @IsString({ message: 'La foto debe ser texto' })
  foto?: string;

  @ApiProperty({ enum: NivelFormacion, example: NivelFormacion.TECNICO })
  @IsEnum(NivelFormacion, { message: 'El nivel de formación no es válido' })
  nivelFormacion: NivelFormacion;

  @ApiPropertyOptional({ example: 'Referido por clientes de la zona.' })
  @IsOptional()
  @IsString({ message: 'Las recomendaciones deben ser texto' })
  recomendaciones?: string;
}
