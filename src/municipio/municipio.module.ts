import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MunicipioController } from './municipio.controller';
import { MunicipioService } from './municipio.service';
import { Municipio } from './entities/municipio.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Municipio, User])],
  controllers: [MunicipioController],
  providers: [MunicipioService],
})
export class MunicipioModule {}
