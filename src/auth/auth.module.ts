import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    // Importar UserModule para acceder a UserService
    UserModule,

    // Configurar Passport con 'jwt' como estrategia por defecto
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Configurar JWT leyendo el secreto y la expiración del .env
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        // JWT_EXPIRATION acepta segundos ('900') o intervalos de jsonwebtoken
        // ('15m', '1d', ...). Si es solo dígitos se interpreta en segundos
        // (formato original); si no, se pasa tal cual a jsonwebtoken.
        const rawExpiration: string =
          configService.getOrThrow<string>('JWT_EXPIRATION');
        // Segundos si son solo dígitos; intervalos ('15m', '1d') tal cual.
        const expiresIn: number | StringValue = /^\d+$/.test(rawExpiration)
          ? Number(rawExpiration)
          : (rawExpiration as StringValue);
        return {
          secret: configService.getOrThrow<string>('JWT_SECRET'),
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}