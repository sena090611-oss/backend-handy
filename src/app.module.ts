import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
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
        const cfg = {
          type: 'mysql' as const,
          host: configService.getOrThrow<string>('DB_HOST'),
          port: Number(configService.getOrThrow<string>('DB_PORT')),
          username: configService.getOrThrow<string>('DB_USERNAME'),
          // Si el .env no define DB_PASSWORD, usamos cadena vacía para evitar que mysql2 reciba `undefined`
          password: configService.get<string>('DB_PASSWORD') ?? '',
          database: configService.getOrThrow<string>('DB_DATABASE'),
          autoLoadEntities: true,
          synchronize: true,
        };
        return cfg;
      },
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
  ],
})
export class AppModule {}