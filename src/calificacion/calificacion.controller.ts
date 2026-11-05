import { Controller, Post, Body, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CalificacionService } from './calificacion.service';
import { CreateCalificacionDto } from './dto/create-calificacion.dto';
import { Calificacion } from './entities/calificacion.entity';
import { ApiCreatedResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';

@Controller('calificaciones')
@ApiTags('Calificaciones')
export class CalificacionController {
  constructor(private readonly calificacionService: CalificacionService) {}

  /** Crea una calificación para la solicitud indicada */
  @Post()
  @ApiCreatedResponse({ type: Calificacion })
  async create(@Body() dto: CreateCalificacionDto): Promise<Calificacion> {
    return this.calificacionService.create(dto);
  }

  /** Obtiene la calificación asociada a una solicitud */
  @Get('solicitud/:id')
  @ApiParam({ name: 'id', example: 12, description: 'ID de la solicitud' })
  @ApiOkResponse({ type: Calificacion, nullable: true })
  async findBySolicitud(
    @Param('id', ParseIntPipe) solicitudId: number,
  ): Promise<Calificacion | null> {
    return this.calificacionService.findBySolicitud(solicitudId);
  }
}
