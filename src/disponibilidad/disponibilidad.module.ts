/**
 * Módulo de disponibilidad.
 * Registra la entidad de disponibilidad y el servicio que administra la jornada del trabajador.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trabajador } from '../trabajador/entities/trabajador.entity';
import { DisponibilidadController } from './disponibilidad.controller';
import { Disponibilidad } from './entities/disponibilidad.entity';
import { DisponibilidadService } from './disponibilidad.service';

@Module({
  imports: [TypeOrmModule.forFeature([Disponibilidad, Trabajador])],
  controllers: [DisponibilidadController],
  providers: [DisponibilidadService],
})
export class DisponibilidadModule {}
