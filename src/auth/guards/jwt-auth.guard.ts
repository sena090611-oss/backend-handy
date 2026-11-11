/**
 * Guard de autenticación basado en JWT.
 * Cualquier ruta protegida con este guard exige un token válido del usuario.
 */
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard que protege rutas usando JWT
 * Extiende de AuthGuard('jwt') que usa la estrategia JwtStrategy
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}