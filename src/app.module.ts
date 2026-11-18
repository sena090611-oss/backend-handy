import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MunicipioModule } from './municipio/municipio.module';
import { PortafolioModule } from './portafolio/portafolio.module';
import { SolicitudDeServicioModule } from './solicitud_de_servicio/solicitud_de_servicio.module';
import { ZonaModule } from './zona/zona.module';
import { TrabajadorModule } from './trabajador/trabajador.module';
// Módulo que gestiona la entidad Calificacion y su lógica de negocio
import { CalificacionModule } from './calificacion/calificacion.module';
import { DisponibilidadModule } from './disponibilidad/disponibilidad.module';
import { ReporteIncidenteModule } from './reporte_incidente/reporte-incidente.module';
import { DetallePortafolioModule } from './detalle_portafolio/detalle_portafolio/detalle-portafolio.module';

@Module({
  imports: [
    // Configuración de variables de entorno
    // isGlobal: true hace que ConfigService esté disponible en toda la app
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuración de TypeORM con MySQL
    // useFactory permite inyectar ConfigService para leer variables de entorno
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        // En producción el esquema se gestiona con migraciones, nunca con
        // synchronize; en desarrollo se sincroniza automáticamente.
        const isProduction: boolean =
          configService.get<string>('NODE_ENV') === 'production';
        const cfg = {
          type: 'mysql' as const,
          host: configService.getOrThrow<string>('DB_HOST'),
          port: Number(configService.getOrThrow<string>('DB_PORT')),
          username: configService.getOrThrow<string>('DB_USERNAME'),
          // Si el .env no define DB_PASSWORD, usamos cadena vacía para evitar que mysql2 reciba `undefined`
          password: configService.get<string>('DB_PASSWORD') ?? '',
          database: configService.getOrThrow<string>('DB_DATABASE'),
          autoLoadEntities: true,
          synchronize: !isProduction,
          // Migraciones de TypeORM (carpeta src/migrations). Se compilan a
          // dist/migrations junto con el resto del proyecto.
          migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
          migrationsTableName: 'migrations',
          // false: las migraciones se aplican manualmente con
          // `npm run migration:run` al desplegar en producción.
          migrationsRun: false,
        };
        return cfg;
      },
    }),

    // Rate limiting global (hardening de producción). Por defecto 100
    // peticiones por minuto por IP; configurable con THROTTLE_LIMIT y
    // THROTTLE_TTL_MS.
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            // Milisegundos de la ventana de tiempo.
            ttl: Number(configService.get<string>('THROTTLE_TTL_MS') ?? 60_000),
            // Máximo de peticiones por ventana por IP.
            limit: Number(configService.get<string>('THROTTLE_LIMIT') ?? 100),
          },
        ],
      }),
    }),

    // Módulos de la aplicación
    UserModule,
    AuthModule,
    MunicipioModule,
    PortafolioModule,
    SolicitudDeServicioModule,
    ZonaModule,
    TrabajadorModule,
    CalificacionModule,
    DisponibilidadModule,
    ReporteIncidenteModule,
    DetallePortafolioModule,
  ],
  // Guard global de rate limiting (se aplica a todos los endpoints).
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}