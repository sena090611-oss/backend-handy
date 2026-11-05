import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Portafolio } from '../../portafolio/entities/portafolio.entity';
import { Trabajador } from '../../trabajador/entities/trabajador.entity';
import { DetallePortafolioController } from './detalle-portafolio.controller';
import { DetallePortafolio } from './entities/detalle-portafolio.entity';
import { DetallePortafolioService } from './detalle-portafolio.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DetallePortafolio, Trabajador, Portafolio]),
  ],
  controllers: [DetallePortafolioController],
  providers: [DetallePortafolioService],
})
export class DetallePortafolioModule {}
