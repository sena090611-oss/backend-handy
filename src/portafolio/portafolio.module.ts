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