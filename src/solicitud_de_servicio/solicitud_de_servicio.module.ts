// Módulo NestJS que agrupa la entidad, controlador y servicio de
// `SolicitudDeServicio`.
import { Module } from '@nestjs/common'; // Decorador @Module.
import { TypeOrmModule } from '@nestjs/typeorm'; // Integra TypeORM.
import { SolicitudDeServicio } from './entities/solicitud-de-servicio.entity'; // Entidad principal.
import { User } from '../user/entities/user.entity'; // Necesaria para la relación FK.
import { Trabajador } from '../trabajador/entities/trabajador.entity'; // Relación opcional al trabajador.
import { SolicitudDeServicioController } from './solicitud_de_servicio.controller'; // Endpoints HTTP.
import { SolicitudDeServicioService } from './solicitud_de_servicio.service'; // Lógica de negocio.

@Module({
  // Registramos las entidades para que TypeORM las gestione.
  imports: [TypeOrmModule.forFeature([SolicitudDeServicio, User, Trabajador])],
  // Declaramos el controlador que expondrá la API.
  controllers: [SolicitudDeServicioController],
  // Declaramos el servicio que contiene la lógica de negocio.
  providers: [SolicitudDeServicioService],
})
export class SolicitudDeServicioModule {}
