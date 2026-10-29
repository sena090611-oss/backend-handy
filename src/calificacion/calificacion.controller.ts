import { Controller, Post, Body, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CalificacionService } from './calificacion.service';
import { CreateCalificacionDto } from './dto/create-calificacion.dto';
import { Calificacion } from './entities/calificacion.entity';

@Controller('calificaciones')
export class CalificacionController {
  constructor(private readonly calificacionService: CalificacionService) {}

  /** Crea una calificación para la solicitud indicada */
  @Post()
  async create(@Body() dto: CreateCalificacionDto): Promise<Calificacion> {
    return this.calificacionService.create(dto);
  }

  /** Obtiene la calificación asociada a una solicitud */
  @Get('solicitud/:id')
  async findBySolicitud(
    @Param('id', ParseIntPipe) solicitudId: number,
  ): Promise<Calificacion | null> {
    return this.calificacionService.findBySolicitud(solicitudId);
  }
}
