/**
 * DTO para iniciar sesión.
 * Valida el correo y la contraseña del usuario antes de permitir el acceso.
 */
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'cliente@handy.com', description: 'Correo registrado' })
  // Validación de email
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @ApiProperty({ example: 'Handy123!' })
  // Validación de contraseña
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}