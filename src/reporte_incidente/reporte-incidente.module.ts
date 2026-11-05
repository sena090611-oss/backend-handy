import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReporteIncidente } from './entities/reporte-incidente.entity';
import { SolicitudDeServicio } from '../solicitud_de_servicio/entities/solicitud-de-servicio.entity';
import { ReporteIncidenteService } from './reporte-incidente.service';
import { ReporteIncidenteController } from './reporte-incidente.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReporteIncidente, SolicitudDeServicio])],
  providers: [ReporteIncidenteService],
  controllers: [ReporteIncidenteController],
})
export class ReporteIncidenteModule {}
