import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import { UpdateEstadoTrabajadorDto } from './dto/update-estado-trabajador.dto';
import { UpdateTrabajadorDto } from './dto/update-trabajador.dto';
import { Trabajador } from './entities/trabajador.entity';
import { TrabajadorService } from './trabajador.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@Controller('trabajadores')
@ApiTags('Trabajadores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrabajadorController {
  constructor(private readonly trabajadorService: TrabajadorService) {}

  @Post()
  @ApiCreatedResponse({ type: Trabajador })
  @Roles('admin')
  create(@Body() dto: CreateTrabajadorDto): Promise<Trabajador> {
    return this.trabajadorService.create(dto);
  }

  @Get()
  @ApiOkResponse({ type: [Trabajador] })
  @Roles('admin')
  findAll(): Promise<Trabajador[]> {
    return this.trabajadorService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', example: 3, description: 'ID del trabajador' })
  @ApiOkResponse({ type: Trabajador })
  @Roles('admin')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Trabajador> {
    return this.trabajadorService.findOne(id);
  }

  @Patch(':id/estado')
  @ApiParam({ name: 'id', example: 3, description: 'ID del trabajador' })
  @ApiOkResponse({ type: Trabajador })
  @Roles('admin')
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoTrabajadorDto,
  ): Promise<Trabajador> {
    return this.trabajadorService.updateEstado(id, dto);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', example: 3, description: 'ID del trabajador' })
  @ApiOkResponse({ type: Trabajador })
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTrabajadorDto,
  ): Promise<Trabajador> {
    return this.trabajadorService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.trabajadorService.remove(id);
  }
}
