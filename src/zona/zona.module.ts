import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Municipio } from '../municipio/entities/municipio.entity';
import { ZonaController } from './zona.controller';
import { Zona } from './entities/zona.entity';
import { ZonaService } from './zona.service';

@Module({
  imports: [TypeOrmModule.forFeature([Zona, Municipio])],
  controllers: [ZonaController],
  providers: [ZonaService],
})
export class ZonaModule {}
