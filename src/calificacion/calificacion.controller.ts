import { Controller, Post, Body, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CalificacionService } from './calificacion.service';
import { CreateCalificacionDto } from './dto/create-calificacion.dto';
import { Calificacion } from './entities/calificacion.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';

@Controller('calificaciones')
@ApiTags('Calificaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class CalificacionController {
  constructor(private readonly calificacionService: CalificacionService) {}

  /** Permite al cliente autor de la solicitud calificar al trabajador asignado. */
  @Post()
  @Roles('cliente')
  @ApiCreatedResponse({ type: Calificacion })
  async createByCliente(
    @Body() dto: CreateCalificacionDto,
    @GetUser() usuario: User,
  ): Promise<Calificacion> {
    return this.calificacionService.createByCliente(dto, usuario);
  }

  /** Permite al trabajador asignado calificar al cliente de la solicitud. */
  @Post('trabajador-cliente')
  @Roles('trabajador')
  @ApiCreatedResponse({ type: Calificacion })
  async createByTrabajador(
    @Body() dto: CreateCalificacionDto,
    @GetUser() usuario: User,
  ): Promise<Calificacion> {
    return this.calificacionService.createByTrabajador(dto, usuario);
  }

  /** Obtiene las calificaciones de ambos participantes asociadas a una solicitud. */
  @Get('solicitud/:id')
  @Roles('cliente', 'trabajador', 'admin')
  @ApiParam({ name: 'id', example: 12, description: 'ID de la solicitud' })
  @ApiOkResponse({ type: [Calificacion] })
  async findBySolicitud(
    @Param('id', ParseIntPipe) solicitudId: number,
  ): Promise<Calificacion[]> {
    return this.calificacionService.findBySolicitud(solicitudId);
  }
}
