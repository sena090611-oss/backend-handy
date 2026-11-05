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
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../user/entities/user.entity';
import { CreateDisponibilidadDto } from './dto/create-disponibilidad.dto';
import { UpdateDisponibilidadDto } from './dto/update-disponibilidad.dto';
import { Disponibilidad } from './entities/disponibilidad.entity';
import { DisponibilidadService } from './disponibilidad.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@Controller('disponibilidades')
@ApiTags('Disponibilidades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('trabajador', 'admin')
export class DisponibilidadController {
  constructor(private readonly disponibilidadService: DisponibilidadService) {}

  @Post()
  @ApiCreatedResponse({ type: Disponibilidad })
  create(
    @Body() dto: CreateDisponibilidadDto,
    @GetUser() usuario: User,
  ): Promise<Disponibilidad> {
    return this.disponibilidadService.create(dto, usuario);
  }

  @Get()
  @ApiOkResponse({ type: [Disponibilidad] })
  findAll(@GetUser() usuario: User): Promise<Disponibilidad[]> {
    return this.disponibilidadService.findAll(usuario);
  }

  @Get(':id')
  @ApiParam({ name: 'id', example: 7, description: 'ID de la disponibilidad' })
  @ApiOkResponse({ type: Disponibilidad })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() usuario: User,
  ): Promise<Disponibilidad> {
    return this.disponibilidadService.findOne(id, usuario);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', example: 7, description: 'ID de la disponibilidad' })
  @ApiOkResponse({ type: Disponibilidad })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDisponibilidadDto,
    @GetUser() usuario: User,
  ): Promise<Disponibilidad> {
    return this.disponibilidadService.update(id, dto, usuario);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() usuario: User,
  ): Promise<void> {
    return this.disponibilidadService.remove(id, usuario);
  }
}
