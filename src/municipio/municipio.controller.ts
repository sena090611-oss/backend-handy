import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards, Query } from '@nestjs/common';
import { MunicipioService } from './municipio.service';
import { CreateMunicipioDto } from './dto/create-municipios.dto';
import { UpdateMunicipioDto } from './dto/update-municipio.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('municipio')
//@UseGuards(JwtAuthGuard, RolesGuard)
export class MunicipioController {
	constructor(private readonly municipioService: MunicipioService) {}

	@Post()
	create(@Body() dto: CreateMunicipioDto) {
		return this.municipioService.create(dto);
	}

	@Get()
	findAll() {
		return this.municipioService.findAll();
	}

	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.municipioService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMunicipioDto) {
		return this.municipioService.update(id, dto);
	}

  /**
   * Obtiene la cantidad de trabajadores (usuarios con rol "trabajador") en el municipio.
   * Se puede filtrar opcionalmente por ocupación mediante el query param `occupation`.
   */
  @Get(':id/trabajadores')
  countWorkers(
    @Param('id', ParseIntPipe) id: number,
    @Query('occupation') occupation?: string,
  ) {
    return this.municipioService.countWorkers(id, occupation);
  }

	
}
