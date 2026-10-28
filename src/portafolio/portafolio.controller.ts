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
import { CreatePortafolioDto } from './dto/create-portafolio.dto';
import { UpdatePortafolioDto } from './dto/update-portafolio.dto';
import { Portafolio } from './entities/portafolio.entity';
import { PortafolioService } from './portafolio.service';

@Controller('portafolio')
export class PortafolioController {
  constructor(private readonly portafolioService: PortafolioService) {}

  @Post()
  create(@Body() dto: CreatePortafolioDto): Promise<Portafolio> {
    return this.portafolioService.create(dto);
  }

  @Get()
  findAll(): Promise<Portafolio[]> {
    return this.portafolioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Portafolio> {
    return this.portafolioService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePortafolioDto,
  ): Promise<Portafolio> {
    return this.portafolioService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.portafolioService.remove(id);
  }
}