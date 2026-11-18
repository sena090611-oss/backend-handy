// Módulo NestJS que agrupa la entidad, controlador y servicio de
// `SolicitudDeServicio`.
import { Module } from '@nestjs/common'; // Decorador @Module.
import { TypeOrmModule } from '@nestjs/typeorm'; // Integra TypeORM.
import { SolicitudDeServicio } from './entities/solicitud-de-servicio.entity'; // Entidad principal.
import { User } from '../user/entities/user.entity'; // Necesaria para la relación FK.
import { Trabajador } from '../trabajador/entities/trabajador.entity'; // Relación opcional al trabajador.
import { Portafolio } from '../portafolio/entities/portafolio.entity'; // Oficio solicitado (FK id_portafolio).
import { Calificacion } from '../calificacion/entities/calificacion.entity'; // Para calcular promedios.
import { DetallePortafolio } from '../detalle_portafolio/detalle_portafolio/entities/detalle-portafolio.entity'; // Para oficios del portafolio.
import { SolicitudDeServicioController } from './solicitud_de_servicio.controller'; // Endpoints HTTP.
import { SolicitudDeServicioService } from './solicitud_de_servicio.service'; // Lógica de negocio.
import { SolicitudResponseMapper } from './solicitud-response.mapper'; // Mapea entidades a DTOs de respuesta.

@Module({
  // Registramos las entidades para que TypeORM las gestione.
  imports: [
    TypeOrmModule.forFeature([
      SolicitudDeServicio,
      User,
      Trabajador,
      Portafolio,
      Calificacion,
      DetallePortafolio,
    ]),
  ],
  // Declaramos el controlador que expondrá la API.
  controllers: [SolicitudDeServicioController],
  // Declaramos el servicio y el mapper que transforman las respuestas.
  providers: [SolicitudDeServicioService, SolicitudResponseMapper],
})
export class SolicitudDeServicioModule {}
