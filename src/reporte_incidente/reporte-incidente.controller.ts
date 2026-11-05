import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ReporteIncidenteService } from './reporte-incidente.service';
import { CreateReporteIncidenteDto } from './dto/create-reporte-incidente.dto';
import { UpdateReporteIncidenteDto } from './dto/update-reporte-incidente.dto';
import { FilterReporteIncidenteDto } from './dto/filter-reporte-incidente.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ReporteIncidente } from './entities/reporte-incidente.entity';

@Controller('reporte-incidente')
@ApiTags('Reportes de incidentes')
export class ReporteIncidenteController {
  constructor(private readonly service: ReporteIncidenteService) {}

  @Post()
  @ApiCreatedResponse({ type: ReporteIncidente })
  create(@Body() dto: CreateReporteIncidenteDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOkResponse({ type: [ReporteIncidente] })
  findAll(@Query() filter: FilterReporteIncidenteDto) {
    return this.service.findAll(filter);
  }

  @Get(':id')
  @ApiParam({ name: 'id', example: 3, description: 'ID del reporte' })
  @ApiOkResponse({ type: ReporteIncidente })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', example: 3, description: 'ID del reporte' })
  @ApiOkResponse({ type: ReporteIncidente })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReporteIncidenteDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
