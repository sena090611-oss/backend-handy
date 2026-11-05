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
} from '@nestjs/common';
import { SolicitudDeServicioService } from './solicitud_de_servicio.service';
import { CreateSolicitudDeServicioDto } from './dto/create-solicitud-de-servicio.dto';
import { UpdateSolicitudDeServicioDto } from './dto/update-solicitud-de-servicio.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { SolicitudDeServicio } from './entities/solicitud-de-servicio.entity';

/**
 * Controlador REST para la entidad `SolicitudDeServicio`.
 * Expone los endpoints CRUD y operaciones por usuario.
 */
@Controller('solicitudes')
@ApiTags('Solicitudes de servicio')
export class SolicitudDeServicioController {
  // Inyección del servicio que contiene la lógica de negocio.
  constructor(private readonly service: SolicitudDeServicioService) {}

  // Crear una nueva solicitud (POST /solicitudes).
  @Post()
  @ApiCreatedResponse({ type: SolicitudDeServicio })
  create(@Body() dto: CreateSolicitudDeServicioDto) {
    return this.service.create(dto);
  }

  // Obtener todas las solicitudes (GET /solicitudes).
  @Get()
  @ApiOkResponse({ type: [SolicitudDeServicio] })
  findAll() {
    return this.service.findAll();
  }

  // Listar solicitudes de un usuario específico (GET /solicitudes/usuario/:idUsuario).
  @Get('usuario/:idUsuario')
  @ApiParam({ name: 'idUsuario', example: 5, description: 'ID del usuario' })
  @ApiOkResponse({ type: [SolicitudDeServicio] })
  findByUser(@Param('idUsuario', ParseIntPipe) idUsuario: number) {
    return this.service.findByUser(idUsuario);
  }

  // Obtener una solicitud por ID (GET /solicitudes/:id).
  @Get(':id')
  @ApiParam({ name: 'id', example: 12, description: 'ID de la solicitud' })
  @ApiOkResponse({ type: SolicitudDeServicio })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // Actualizar una solicitud existente (PATCH /solicitudes/:id).
  @Patch(':id')
  @ApiParam({ name: 'id', example: 12, description: 'ID de la solicitud' })
  @ApiOkResponse({ type: SolicitudDeServicio })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSolicitudDeServicioDto) {
    return this.service.update(id, dto);
  }

  // Eliminar una solicitud (DELETE /solicitudes/:id).
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
