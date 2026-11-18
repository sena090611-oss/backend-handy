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
import { UpdateOwnUserDto } from './dto/update-own-user.dto';
import { User } from './entities/user.entity';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

// Los guards y el rol aplican a todas las rutas del controlador
// Controlador REST para la entidad User.
// Cada endpoint está protegido con JwtAuthGuard (requiere token)
// y con RolesGuard (verifica que el usuario tenga el rol necesario).
@Controller('users')
@ApiTags('Usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ---------------------------------------------------------------
  // CREATE – solo Admin puede crear usuarios directamente.
  @Post()
  @Roles('admin')
  @ApiCreatedResponse({ type: User })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  // ---------------------------------------------------------------
  // READ ALL – solo Admin puede listar todos los usuarios completos.
  // ---------------------------------------------------------------
  @Get()
  @Roles('admin')
  @ApiOkResponse({ type: [User] })
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('me')
  @Roles('admin', 'trabajador', 'cliente')
  @ApiOkResponse({ type: User })
  findMine(@GetUser() usuario: User): Promise<User> {
    return this.userService.findMine(usuario);
  }

  @Patch('me')
  @Roles('admin', 'trabajador', 'cliente')
  @ApiOkResponse({ type: User })
  updateMine(
    @GetUser() usuario: User,
    @Body() dto: UpdateOwnUserDto,
  ): Promise<User> {
    return this.userService.updateMine(usuario, dto);
  }

  // ---------------------------------------------------------------
  // READ ONE – solo un administrador puede consultar otro usuario por ID.
  // ---------------------------------------------------------------
  @Get(':id')
  @Roles('admin')
  @ApiParam({ name: 'id', example: 5, description: 'ID del usuario' })
  @ApiOkResponse({ type: User })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() usuario: User,
  ): Promise<User> {
    return this.userService.findOne(id, usuario);
  }

  // ---------------------------------------------------------------
  // UPDATE – solo Admin puede modificar usuarios y aprobar sus cuentas.
  // ---------------------------------------------------------------
  @Patch(':id')
  @Roles('admin')
  @ApiParam({ name: 'id', example: 5, description: 'ID del usuario' })
  @ApiOkResponse({ type: User })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(id, updateUserDto);
  }

  // ---------------------------------------------------------------
  // DELETE – eliminar un usuario.
  // Sólo el rol Admin está autorizado para esta operación.
  // Si el usuario tiene solicitudes o ficha de trabajador se hace borrado
  // lógico (queda SUSPENDIDO); si no, se elimina físicamente.
  // ---------------------------------------------------------------
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.remove(id);
  }
}