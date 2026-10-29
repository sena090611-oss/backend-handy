import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Calificacion } from './entities/calificacion.entity';
import { CalificacionService } from './calificacion.service';
import { CalificacionController } from './calificacion.controller';
import { SolicitudDeServicio } from '../solicitud_de_servicio/entities/solicitud-de-servicio.entity';

@Module({
  // Registra las entidades Calificacion y SolicitudDeServicio en el repositorio TypeORM
  imports: [TypeOrmModule.forFeature([Calificacion, SolicitudDeServicio])],
  controllers: [CalificacionController],
  providers: [CalificacionService],
  // Exporta el servicio para que pueda ser usado en otros módulos (p.ej., Trabajador)
  exports: [CalificacionService],
})
export class CalificacionModule {}
