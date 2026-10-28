import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Municipio } from '../municipio/entities/municipio.entity';
import { User } from '../user/entities/user.entity';
import { Zona } from '../zona/entities/zona.entity';
import { TrabajadorController } from './trabajador.controller';
import { Trabajador } from './entities/trabajador.entity';
import { TrabajadorService } from './trabajador.service';

@Module({
  imports: [TypeOrmModule.forFeature([Trabajador, User, Zona, Municipio])],
  controllers: [TrabajadorController],
  providers: [TrabajadorService],
})
export class TrabajadorModule {}
