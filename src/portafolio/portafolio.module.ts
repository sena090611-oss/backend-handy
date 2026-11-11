/**
 * Módulo de portafolios.
 * Registra la entidad Portafolio y sus endpoints para administrar los oficios del sistema.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortafolioController } from './portafolio.controller';
import { PortafolioService } from './portafolio.service';
import { Portafolio } from './entities/portafolio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Portafolio])],
  controllers: [PortafolioController],
  providers: [PortafolioService],
})
export class PortafolioModule {}