/**
 * Decorador que extrae la información del usuario autenticado desde la request.
 * Se usa para recuperar el perfil del cliente o trabajador que envió el token JWT.
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';

/**
 * Decorador personalizado para extraer el usuario del request
 * (el usuario lo asigna JwtStrategy.validate())
 * Uso: @GetUser() user: User
 */
export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<{ user: User }>();
    return request.user;
  },
);