// El DTO de actualización extiende parcialmente el DTO de creación, haciendo
// que todas sus propiedades sean opcionales. Añadimos validaciones extras
// para los campos que pueden modificarse después de la creación.
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsInt, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { UserRole, UserStatus } from '../entities/user.entity';

// PartialType hace que todas las propiedades de CreateUserDto sean opcionales
export class UpdateUserDto extends PartialType(CreateUserDto) {
  // Campo opcional para actualizar el estado del usuario
  @IsEnum(UserStatus, { message: 'El estado debe ser pendiente, activo o suspendido' })
  @IsOptional()
  isActive?: UserStatus;

  // Campo opcional para actualizar el rol
  @IsEnum(UserRole, { message: 'El rol debe ser admin, cliente o trabajador' })
  @IsOptional()
  role?: UserRole;

  // ---------------------------------------
  // Campos adicionales que pueden ser actualizados
  // ---------------------------------------
  // Permite cambiar el nombre del usuario (se guarda en la columna fullName).
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsOptional()
  nombre?: string;

  // Permite cambiar el municipio al que pertenece el usuario.
  @IsInt({ message: 'id_municipio debe ser un número entero' })
  @IsOptional()
  id_municipio?: number;
}