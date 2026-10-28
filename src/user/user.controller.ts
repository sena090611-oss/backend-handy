import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// Los guards y el rol aplican a todas las rutas del controlador
// Controlador REST para la entidad User.
// Cada endpoint está protegido con JwtAuthGuard (requiere token)
// y con RolesGuard (verifica que el usuario tenga el rol necesario).
@Controller('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ---------------------------------------------------------------
  // CREATE – solo Admin puede crear usuarios directamente.
  @Post()
  @Roles('admin')
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  // ---------------------------------------------------------------
  // READ ALL – solo usuarios con rol Trabajador o Admin pueden
  // listar todos los usuarios.
  // ---------------------------------------------------------------
  @Get()
  @Roles('trabajador', 'cliente', 'admin')
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  // ---------------------------------------------------------------
  // READ ONE – obtener detalle de un usuario por ID.
  // Accesible para Trabajador y Admin.
  // ---------------------------------------------------------------
  @Get(':id')
  @Roles('trabajador', 'cliente', 'admin')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  // ---------------------------------------------------------------
  // UPDATE – solo Admin puede modificar usuarios y aprobar sus cuentas.
  // ---------------------------------------------------------------
  @Patch(':id')
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(id, updateUserDto);
  }

  // ---------------------------------------------------------------
  // DELETE – eliminar físicamente un usuario.
  // Sólo el rol Admin está autorizado para esta operación.
  // ---------------------------------------------------------------
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.remove(id);
  }
}