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
import { CreateZonaDto } from './dto/create-zona.dto';
import { UpdateZonaDto } from './dto/update-zona.dto';
import { Zona } from './entities/zona.entity';
import { ZonaService } from './zona.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';

/**
 * Controlador HTTP para administrar y consultar las zonas.
 * Delega las operaciones de datos a ZonaService.
 */
@Controller('zona')
@ApiTags('Zonas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ZonaController {
  /** Recibe el servicio que implementa las operaciones de zonas. */
  constructor(private readonly zonaService: ZonaService) {}

  /** Crea una zona con los datos validados del cuerpo de la solicitud. */
  @Post()
  @Roles('admin')
  @ApiCreatedResponse({ type: Zona })
  create(@Body() dto: CreateZonaDto): Promise<Zona> {
    return this.zonaService.create(dto);
  }

  /** Devuelve la lista completa de zonas. */
  @Get()
  @Roles('trabajador', 'cliente', 'admin')
  @ApiOkResponse({ type: [Zona] })
  findAll(): Promise<Zona[]> {
    return this.zonaService.findAll();
  }

  /** Busca y devuelve una zona a partir de su identificador numérico. */
  @Get(':id')
  @Roles('trabajador', 'cliente', 'admin')
  @ApiParam({ name: 'id', example: 4, description: 'ID de la zona' })
  @ApiOkResponse({ type: Zona })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Zona> {
    return this.zonaService.findOne(id);
  }

  /** Actualiza una zona existente con los datos recibidos en la solicitud. */
  @Patch(':id')
  @Roles('admin')
  @ApiParam({ name: 'id', example: 4, description: 'ID de la zona' })
  @ApiOkResponse({ type: Zona })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateZonaDto,
  ): Promise<Zona> {
    return this.zonaService.update(id, dto);
  }

  /** Elimina la zona indicada y responde sin contenido. */
  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.zonaService.remove(id);
  }
}
