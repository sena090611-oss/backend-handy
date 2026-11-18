import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REQUIRES_LETTER_AND_NUMBER,
} from '../../user/password-policy';

export class ChangePasswordDto {
  @ApiProperty({ example: 'PasswordActual1' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'PasswordNueva2' })
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`,
  })
  @Matches(PASSWORD_REQUIRES_LETTER_AND_NUMBER, {
    message: 'La contraseña debe incluir al menos una letra y un número',
  })
  newPassword: string;
}
