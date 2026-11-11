/**
 * Decorador para restringir rutas por roles de usuario.
 * Permite marcar controladores o métodos con los permisos requeridos.
 */
import { CustomDecorator, SetMetadata } from '@nestjs/common';

// Clave compartida entre el decorador y el guard (evita errores de escritura)
export const ROLES_KEY = 'roles';

/**
 * Decorador para especificar roles requeridos
 * Uso: @Roles('admin', 'moderator')
 */
export const Roles = (...roles: string[]): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, roles);