// Validaciones para los campos del usuario que recibimos en el cuerpo del request.
// Se usan decoradores de class-validator que NestJS interpreta automáticamente.
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
// Importamos el enum UserRole desde la entidad del usuario para usarlo en la validación del rol.
// La ruta relativa sube dos niveles para llegar al directorio raíz del proyecto y luego accede a la entidad.
import { UserRole } from '../../user/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REQUIRES_LETTER_AND_NUMBER,
} from '../password-policy';

export class CreateUserDto {
  @ApiProperty({ example: 'cliente@handy.com' })
  // Validación de email con formato correcto
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  // La contraseña debe tener al menos 8 caracteres, una letra y un número.
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`,
  })
  @Matches(PASSWORD_REQUIRES_LETTER_AND_NUMBER, {
    message: 'La contraseña debe incluir al menos una letra y un número',
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @ApiProperty({ example: 'Handy123!' })
  password: string;

  // Validación de nombre completo
  // Campo opcional que mapea al atributo "fullName" de la entidad.
  // Si el cliente envía "nombre", lo usamos como "fullName" en el Service.
  @ApiPropertyOptional({ example: 'María Pérez' })
  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  @IsOptional()
  fullName?: string;

  // ---------------------------------------
  // Campos añadidos para cumplir la especificación del cliente
  // ---------------------------------------
  // "nombre" será utilizado como alias de "fullName" en la entidad.
  @ApiProperty({ example: 'María Pérez' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  // FK al municipio al que pertenece el usuario.
  @ApiProperty({ example: 1, description: 'ID de un municipio existente' })
  @IsInt({ message: 'id_municipio debe ser un número entero' })
  @IsNotEmpty({ message: 'id_municipio es obligatorio' })
  id_municipio: number;

  // Rol del usuario. Es opcional porque la entidad tiene un valor por defecto.
  @ApiPropertyOptional({ enum: UserRole, example: UserRole.CLIENTE })
  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol debe ser admin, cliente o trabajador' })
  role?: UserRole;

}