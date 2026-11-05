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
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { User } from '../../user/entities/user.entity';
import { CreateDetallePortafolioDto } from './dto/create-detalle-portafolio.dto';
import { UpdateDetallePortafolioDto } from './dto/update-detalle-portafolio.dto';
import { DetallePortafolio } from './entities/detalle-portafolio.entity';
import { DetallePortafolioService } from './detalle-portafolio.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@Controller('detalles-portafolio')
@ApiTags('Detalles de portafolio')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('trabajador', 'admin')
export class DetallePortafolioController {
  constructor(
    private readonly detallePortafolioService: DetallePortafolioService,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: DetallePortafolio })
  create(
    @Body() dto: CreateDetallePortafolioDto,
    @GetUser() usuario: User,
  ): Promise<DetallePortafolio> {
    return this.detallePortafolioService.create(dto, usuario);
  }

  @Get()
  @ApiOkResponse({ type: [DetallePortafolio] })
  findAll(@GetUser() usuario: User): Promise<DetallePortafolio[]> {
    return this.detallePortafolioService.findAll(usuario);
  }

  @Get(':id')
  @ApiParam({ name: 'id', example: 4, description: 'ID del detalle' })
  @ApiOkResponse({ type: DetallePortafolio })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() usuario: User,
  ): Promise<DetallePortafolio> {
    return this.detallePortafolioService.findOne(id, usuario);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', example: 4, description: 'ID del detalle' })
  @ApiOkResponse({ type: DetallePortafolio })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDetallePortafolioDto,
    @GetUser() usuario: User,
  ): Promise<DetallePortafolio> {
    return this.detallePortafolioService.update(id, dto, usuario);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() usuario: User,
  ): Promise<void> {
    return this.detallePortafolioService.remove(id, usuario);
  }
}
