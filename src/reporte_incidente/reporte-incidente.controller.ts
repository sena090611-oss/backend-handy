/**
 * Controlador de reportes de incidentes.
 * Permite crear, consultar, actualizar y eliminar reportes asociados a solicitudes.
 */
// Importamos los decoradores y utilidades de NestJS para definir rutas y
// manejar peticiones HTTP.
import {
  Controller, // Define una clase como controlador de rutas.
  Get, // Maneja peticiones GET.
  Post, // Maneja peticiones POST.
  Patch, // Maneja peticiones PATCH.
  Delete, // Maneja peticiones DELETE.
  Param, // Extrae parámetros de la URL.
  Body, // Extrae el cuerpo de la petición.
  Query, // Extrae los parámetros de consulta (query string).
  ParseIntPipe, // Convierte params strings a número y valida.
  UseGuards, // Aplica guards de autenticación/autorización a las rutas.
} from '@nestjs/common';
// Servicio con la lógica de negocio de los reportes de incidentes.
import { ReporteIncidenteService } from './reporte-incidente.service';
// DTO que valida los datos para crear un reporte.
import { CreateReporteIncidenteDto } from './dto/create-reporte-incidente.dto';
// DTO que valida los datos para actualizar un reporte.
import { UpdateReporteIncidenteDto } from './dto/update-reporte-incidente.dto';
// DTO que valida los filtros de búsqueda del listado.
import { FilterReporteIncidenteDto } from './dto/filter-reporte-incidente.dto';
// Decoradores de Swagger para documentar las respuestas y parámetros.
import {
  ApiBearerAuth, // Indica en Swagger que el endpoint requiere token JWT.
  ApiCreatedResponse, // Documenta una respuesta 201 (recurso creado).
  ApiOkResponse, // Documenta una respuesta 200 (consulta exitosa).
  ApiParam, // Documenta un parámetro de ruta.
  ApiTags, // Agrupa los endpoints bajo una etiqueta en Swagger.
} from '@nestjs/swagger';
// DTO de respuesta seguro para reportes de incidentes.
import { ReporteIncidenteResponseDto } from './dto/reporte-incidente-response.dto';
// Guard que exige un token JWT válido (usuario autenticado).
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// Guard que valida que el usuario tenga alguno de los roles permitidos.
import { RolesGuard } from '../auth/guards/roles.guard';
// Decorador para indicar los roles autorizados en cada endpoint.
import { Roles } from '../auth/decorators/roles.decorator';
// Decorador para obtener el usuario autenticado desde el token JWT.
import { GetUser } from '../auth/decorators/get-user.decorator';
// Entidad del usuario autenticado.
import { User } from '../user/entities/user.entity';

// Ruta base del controlador: /reporte-incidente.
@Controller('reporte-incidente')
// Etiqueta usada para agrupar estos endpoints en la documentación Swagger.
@ApiTags('Reportes de incidentes')
// Todos los endpoints requieren token JWT y se validan por rol.
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReporteIncidenteController {
  // Inyección del servicio que contiene la lógica de negocio.
  constructor(private readonly service: ReporteIncidenteService) {}

  // Crear un nuevo reporte de incidente (POST /reporte-incidente).
  // Solo los participantes de la solicitud o un admin pueden crear reportes.
  @Post()
  @Roles('cliente', 'trabajador', 'admin')
  @ApiCreatedResponse({ type: ReporteIncidenteResponseDto })
  create(
    @Body() dto: CreateReporteIncidenteDto,
    @GetUser() usuario: User,
  ) {
    // Delegamos la creación al servicio y devolvemos el registro creado.
    return this.service.create(dto, usuario);
  }

  // Listar reportes aplicando filtros opcionales (GET /reporte-incidente).
  // El servicio limita el listado a las solicitudes del usuario autenticado.
  @Get()
  @Roles('trabajador', 'cliente', 'admin')
  @ApiOkResponse({ type: [ReporteIncidenteResponseDto] })
  findAll(
    @Query() filter: FilterReporteIncidenteDto,
    @GetUser() usuario: User,
  ) {
    // Enviamos los filtros y el usuario autenticado al servicio.
    return this.service.findAll(filter, usuario);
  }

  // Obtener un reporte por su ID (GET /reporte-incidente/:id).
  // El servicio valida que el usuario participe en la solicitud asociada.
  @Get(':id')
  @Roles('trabajador', 'cliente', 'admin')
  @ApiParam({ name: 'id', example: 3, description: 'ID del reporte' })
  @ApiOkResponse({ type: ReporteIncidenteResponseDto })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() usuario: User,
  ) {
    // Buscamos el reporte por ID; si no existe, el servicio lanza la excepción.
    return this.service.findOne(id, usuario);
  }

  // Actualizar un reporte existente (PATCH /reporte-incidente/:id).
  // Solo el admin o el autor (mientras esté ABIERTO) pueden actualizarlo.
  // El estado solo lo puede cambiar un admin (validado en el servicio).
  @Patch(':id')
  @Roles('cliente', 'trabajador', 'admin')
  @ApiParam({ name: 'id', example: 3, description: 'ID del reporte' })
  @ApiOkResponse({ type: ReporteIncidenteResponseDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReporteIncidenteDto,
    @GetUser() usuario: User,
  ) {
    // Actualizamos solo los campos permitidos y devolvemos el resultado.
    return this.service.update(id, dto, usuario);
  }

  // Eliminar un reporte (DELETE /reporte-incidente/:id).
  // Solo el admin o el autor (mientras esté ABIERTO) pueden eliminarlo.
  @Delete(':id')
  @Roles('cliente', 'trabajador', 'admin')
  @ApiOkResponse({ type: ReporteIncidenteResponseDto })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() usuario: User,
  ) {
    // Eliminamos el reporte indicado y retornamos la confirmación del servicio.
    return this.service.remove(id, usuario);
  }
}
