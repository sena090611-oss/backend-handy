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
} from '@nestjs/common';
import { CreateZonaDto } from './dto/create-zona.dto';
import { UpdateZonaDto } from './dto/update-zona.dto';
import { Zona } from './entities/zona.entity';
import { ZonaService } from './zona.service';
import { ApiCreatedResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';

@Controller('zona')
@ApiTags('Zonas')
export class ZonaController {
  constructor(private readonly zonaService: ZonaService) {}

  @Post()
  @ApiCreatedResponse({ type: Zona })
  create(@Body() dto: CreateZonaDto): Promise<Zona> {
    return this.zonaService.create(dto);
  }

  @Get()
  @ApiOkResponse({ type: [Zona] })
  findAll(): Promise<Zona[]> {
    return this.zonaService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', example: 4, description: 'ID de la zona' })
  @ApiOkResponse({ type: Zona })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Zona> {
    return this.zonaService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', example: 4, description: 'ID de la zona' })
  @ApiOkResponse({ type: Zona })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateZonaDto,
  ): Promise<Zona> {
    return this.zonaService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.zonaService.remove(id);
  }
}
