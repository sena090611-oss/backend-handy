import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Municipio } from '../municipio/entities/municipio.entity';

@Module({
  // Importar el repositorio de User
  imports: [TypeOrmModule.forFeature([User, Municipio])],
  controllers: [UserController],
  providers: [UserService],
  // Exportar el servicio para usarlo en otros módulos (como Auth)
  exports: [UserService],
})
export class UserModule {}