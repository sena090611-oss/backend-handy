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
  Query,
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
import { BuscarTrabajadoresDto } from './dto/buscar-trabajadores.dto';
import { TrabajadoresPaginadosDto } from './dto/trabajador-busqueda.dto';
import { TrabajadorPerfilPublicoDto } from './dto/trabajador-perfil-publico.dto';
import { Jornada } from '../disponibilidad/entities/disponibilidad.entity';
import { CreateTrabajadorPropioDto } from './dto/create-trabajador-propio.dto';
import { UpdateTrabajadorPropioDto } from './dto/update-trabajador-propio.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@Controller('trabajadores')
@ApiTags('Trabajadores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrabajadorController {
  constructor(private readonly trabajadorService: TrabajadorService) {}

  @Post('me')
  @ApiCreatedResponse({ type: Trabajador })
  @Roles('trabajador')
  createMine(
    @Body() dto: CreateTrabajadorPropioDto,
    @GetUser() usuario: User,
  ): Promise<Trabajador> {
    return this.trabajadorService.createMine(dto, usuario);
  }

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

  @Get('buscar')
  @ApiOkResponse({ type: TrabajadoresPaginadosDto })
  @ApiQuery({ name: 'portafolioId', required: false, type: Number })
  @ApiQuery({ name: 'municipioId', required: false, type: Number })
  @ApiQuery({ name: 'zonaId', required: false, type: Number })
  @ApiQuery({ name: 'jornada', required: false, enum: Jornada })
  @ApiQuery({ name: 'calificacionMinima', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @Roles('cliente', 'admin')
  buscar(
    @Query() filtros: BuscarTrabajadoresDto,
  ): Promise<TrabajadoresPaginadosDto> {
    return this.trabajadorService.buscar(filtros);
  }

  @Get(':id/perfil')
  @ApiParam({ name: 'id', example: 3, description: 'ID del trabajador' })
  @ApiOkResponse({ type: TrabajadorPerfilPublicoDto })
  @Roles('cliente', 'admin')
  perfilPublico(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TrabajadorPerfilPublicoDto> {
    return this.trabajadorService.perfilPublico(id);
  }

  @Get('me')
  @ApiOkResponse({ type: Trabajador })
  @Roles('trabajador')
  findMine(@GetUser() usuario: User) {
    return this.trabajadorService.findMine(usuario);
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

  @Patch('me')
  @ApiOkResponse({ type: Trabajador })
  @Roles('trabajador')
  updateMine(
    @Body() dto: UpdateTrabajadorPropioDto,
    @GetUser() usuario: User,
  ): Promise<Trabajador> {
    return this.trabajadorService.updateMine(dto, usuario);
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
