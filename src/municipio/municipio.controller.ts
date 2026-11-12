/**
 * Controlador de municipios.
 * Expone la gestión de los municipios y la consulta de trabajadores asociados.
 */
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards, Query } from '@nestjs/common';
import { MunicipioService } from './municipio.service';
import { CreateMunicipioDto } from './dto/create-municipios.dto';
import { UpdateMunicipioDto } from './dto/update-municipio.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { Municipio } from './entities/municipio.entity';

@Controller('municipio')
@ApiTags('Municipios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class MunicipioController {
	constructor(private readonly municipioService: MunicipioService) {}

	@Post()
	@Roles('admin')
	@ApiCreatedResponse({ type: Municipio })
	create(@Body() dto: CreateMunicipioDto) {
		return this.municipioService.create(dto);
	}

	@Get()
	@Roles('trabajador', 'cliente', 'admin')
	@ApiOkResponse({ type: [Municipio] })
	findAll() {
		return this.municipioService.findAll();
	}

	@Get(':id')
	@Roles('trabajador', 'cliente', 'admin')
	@ApiParam({ name: 'id', example: 1, description: 'ID del municipio' })
	@ApiOkResponse({ type: Municipio })
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.municipioService.findOne(id);
	}

	@Patch(':id')
	@Roles('admin')
	@ApiParam({ name: 'id', example: 1, description: 'ID del municipio' })
	@ApiOkResponse({ type: Municipio })
	update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMunicipioDto) {
		return this.municipioService.update(id, dto);
	}

  /**
   * Obtiene la cantidad de trabajadores (usuarios con rol "trabajador") en el municipio.
   * Se puede filtrar opcionalmente por ocupación mediante el query param `occupation`.
   */
  @Get(':id/trabajadores')
  @Roles('cliente', 'admin')
  @ApiParam({ name: 'id', example: 1, description: 'ID del municipio' })
  @ApiOkResponse({ schema: { example: 18 } })
  countWorkers(
    @Param('id', ParseIntPipe) id: number,
    @Query('occupation') occupation?: string,
  ) {
    return this.municipioService.countWorkers(id, occupation);
  }

	
}
