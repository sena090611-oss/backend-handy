/**
 * Controlador de portafolios o oficios.
 * Permite registrar, listar y actualizar los oficios asociados al perfil del trabajador.
 */
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
import { CreatePortafolioDto } from './dto/create-portafolio.dto';
import { UpdatePortafolioDto } from './dto/update-portafolio.dto';
import { Portafolio } from './entities/portafolio.entity';
import { PortafolioService } from './portafolio.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiCreatedResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';

@Controller('portafolio')
@ApiTags('Portafolio')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PortafolioController {
  /** Recibe el servicio que ejecuta las operaciones de portafolio. */
  constructor(private readonly portafolioService: PortafolioService) {}

  /** Crea un registro de portafolio con los datos recibidos en la solicitud. */
  @Post()
  @Roles('admin')
  @ApiCreatedResponse({ type: Portafolio })
  create(@Body() dto: CreatePortafolioDto): Promise<Portafolio> {
    return this.portafolioService.create(dto);
  }

  /** Devuelve todos los registros de portafolio. */
  @Get()
  @Roles('trabajador', 'cliente', 'admin')
  @ApiOkResponse({ type: [Portafolio] })
  findAll(): Promise<Portafolio[]> {
    return this.portafolioService.findAll();
  }

  /** Busca un registro de portafolio por su identificador numérico. */
  @Get(':id')
  @Roles('trabajador', 'cliente', 'admin')
  @ApiParam({ name: 'id', example: 2, description: 'ID del oficio' })
  @ApiOkResponse({ type: Portafolio })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Portafolio> {
    return this.portafolioService.findOne(id);
  }

  /** Actualiza el registro indicado con los campos enviados en la solicitud. */
  @Patch(':id')
  @Roles('admin', 'trabajador')
  @ApiParam({ name: 'id', example: 2, description: 'ID del oficio' })
  @ApiOkResponse({ type: Portafolio })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePortafolioDto,
  ): Promise<Portafolio> {
    return this.portafolioService.update(id, dto);
  }

  /** Elimina el registro indicado y devuelve una respuesta sin contenido. */
  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.portafolioService.remove(id);
  }
}