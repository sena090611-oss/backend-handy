// Importamos los decoradores y utilidades de NestJS para definir rutas y
// manejar peticiones HTTP.
import {
  Controller, // Define una clase como controlador de rutas.
  Get, // Maneja peticiones GET.
  Post, // Maneja peticiones POST.
  Body, // Extrae el cuerpo de la petición.
  Param, // Extrae parámetros de la URL.
  Patch, // Maneja peticiones PATCH.
  Delete, // Maneja peticiones DELETE.
  ParseIntPipe, // Convierte param strings a número y valida.
  UseGuards,
} from '@nestjs/common';
import { SolicitudDeServicioService } from './solicitud_de_servicio.service';
import { CreateSolicitudDeServicioDto } from './dto/create-solicitud-de-servicio.dto';
import { UpdateSolicitudDeServicioDto } from './dto/update-solicitud-de-servicio.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { SolicitudResponseDto } from './dto/solicitud-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { AsignarSolicitudDto } from './dto/asignar-solicitud.dto';

/**
 * Controlador REST para la entidad `SolicitudDeServicio`.
 * Expone los endpoints CRUD y operaciones por usuario.
 */
@Controller('solicitudes')
@ApiTags('Solicitudes de servicio')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class SolicitudDeServicioController {
  // Inyección del servicio que contiene la lógica de negocio.
  constructor(private readonly service: SolicitudDeServicioService) {}

  // Crear una nueva solicitud (POST /solicitudes).
  // El dueño se obtiene del token JWT, nunca del cuerpo de la petición.
  @Post()
  @Roles('admin', 'cliente')
  @ApiCreatedResponse({ type: SolicitudResponseDto })
  create(
    @Body() dto: CreateSolicitudDeServicioDto,
    @GetUser() usuario: User,
  ) {
    return this.service.create(dto, usuario);
  }

  // Obtener todas las solicitudes (GET /solicitudes). Solo administradores.
  @Get()
  @Roles('admin')
  @ApiOkResponse({ type: [SolicitudResponseDto] })
  findAll(@GetUser() usuario: User) {
    return this.service.findAll(usuario);
  }

  // Listar las solicitudes del usuario autenticado (GET /solicitudes/mias).
  // Se declara antes de ':id' para que esa ruta no la capture.
  @Get('mias')
  @Roles('admin', 'cliente', 'trabajador')
  @ApiOkResponse({ type: [SolicitudResponseDto] })
  findMias(@GetUser() usuario: User) {
    return this.service.findMias(usuario);
  }

  // Listar solicitudes de un usuario específico (GET /solicitudes/usuario/:idUsuario).
  // Ruta reservada a administradores.
  @Get('usuario/:idUsuario')
  @Roles('admin')
  @ApiParam({ name: 'idUsuario', example: 5, description: 'ID del usuario' })
  @ApiOkResponse({ type: [SolicitudResponseDto] })
  findByUser(
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
    @GetUser() usuario: User,
  ) {
    return this.service.findByUser(idUsuario, usuario);
  }

  @Post(':id/asignar')
  @Roles('admin', 'cliente')
  @ApiParam({ name: 'id', example: 12, description: 'ID de la solicitud' })
  @ApiOkResponse({ type: SolicitudResponseDto })
  asignar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AsignarSolicitudDto,
    @GetUser() usuario: User,
  ) {
    return this.service.asignar(id, dto.trabajadorId, usuario);
  }

  @Patch(':id/aceptar')
  @Roles('trabajador')
  @ApiParam({ name: 'id', example: 12, description: 'ID de la solicitud' })
  @ApiOkResponse({ type: SolicitudResponseDto })
  aceptar(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() usuario: User,
  ) {
    return this.service.aceptar(id, usuario);
  }

  @Patch(':id/rechazar')
  @Roles('trabajador')
  @ApiParam({ name: 'id', example: 12, description: 'ID de la solicitud' })
  @ApiOkResponse({ type: SolicitudResponseDto })
  rechazar(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() usuario: User,
  ) {
    return this.service.rechazar(id, usuario);
  }

  @Patch(':id/iniciar')
  @Roles('trabajador')
  @ApiParam({ name: 'id', example: 12, description: 'ID de la solicitud' })
  @ApiOkResponse({ type: SolicitudResponseDto })
  iniciar(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() usuario: User,
  ) {
    return this.service.iniciar(id, usuario);
  }

  @Patch(':id/completar')
  @Roles('trabajador')
  @ApiParam({ name: 'id', example: 12, description: 'ID de la solicitud' })
  @ApiOkResponse({ type: SolicitudResponseDto })
  completar(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() usuario: User,
  ) {
    return this.service.completar(id, usuario);
  }

  @Patch(':id/cancelar')
  @Roles('admin', 'cliente')
  @ApiParam({ name: 'id', example: 12, description: 'ID de la solicitud' })
  @ApiOkResponse({ type: SolicitudResponseDto })
  cancelar(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() usuario: User,
  ) {
    return this.service.cancelar(id, usuario);
  }

  // Obtener una solicitud por ID (GET /solicitudes/:id).
  // El servicio valida el acceso según el rol del usuario autenticado.
  @Get(':id')
  @Roles('admin', 'cliente', 'trabajador')
  @ApiParam({ name: 'id', example: 12, description: 'ID de la solicitud' })
  @ApiOkResponse({ type: SolicitudResponseDto })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() usuario: User,
  ) {
    return this.service.findOne(id, usuario);
  }

  // Actualizar una solicitud existente (PATCH /solicitudes/:id).
  // Solo el dueño o un administrador pueden modificarla.
  @Patch(':id')
  @Roles('admin', 'cliente')
  @ApiParam({ name: 'id', example: 12, description: 'ID de la solicitud' })
  @ApiOkResponse({ type: SolicitudResponseDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSolicitudDeServicioDto,
    @GetUser() usuario: User,
  ) {
    return this.service.update(id, dto, usuario);
  }

  // Eliminar una solicitud (DELETE /solicitudes/:id).
  // Solo el dueño o un administrador pueden eliminarla.
  @Delete(':id')
  @Roles('admin', 'cliente')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() usuario: User,
  ) {
    return this.service.remove(id, usuario);
  }
}
