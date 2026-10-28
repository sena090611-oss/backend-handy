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

export class CreateTrabajadorDto {
  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @Min(1, { message: 'El ID del usuario debe ser mayor que cero' })
  usuarioId: number;

  @IsInt({ message: 'El ID de la zona debe ser un número entero' })
  @Min(1, { message: 'El ID de la zona debe ser mayor que cero' })
  zonaId: number;

  @IsInt({ message: 'El ID del municipio debe ser un número entero' })
  @Min(1, { message: 'El ID del municipio debe ser mayor que cero' })
  municipioId: number;

  @IsEnum(TipoDocumento, { message: 'El tipo de documento no es válido' })
  tipoDoc: TipoDocumento;

  @IsString({ message: 'El número de documento debe ser texto' })
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  numDoc: string;

  @IsString({ message: 'Los nombres deben ser texto' })
  @IsNotEmpty({ message: 'Los nombres son obligatorios' })
  nombres: string;

  @IsString({ message: 'Los apellidos deben ser texto' })
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  apellidos: string;

  @IsString({ message: 'La dirección debe ser texto' })
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  direccion: string;

  @IsEmail({}, { message: 'El email debe ser válido' })
  email: string;

  @IsString({ message: 'El teléfono debe ser texto' })
  @Length(1, 10, { message: 'El teléfono debe tener máximo 10 caracteres' })
  telefono: string;

  @IsOptional()
  @IsString({ message: 'La foto debe ser texto' })
  foto?: string;

  @IsEnum(NivelFormacion, { message: 'El nivel de formación no es válido' })
  nivelFormacion: NivelFormacion;

  @IsOptional()
  @IsString({ message: 'Las recomendaciones deben ser texto' })
  recomendaciones?: string;
}
