import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Jornada } from '../../disponibilidad/entities/disponibilidad.entity';

export class BuscarTrabajadoresDto {
  @ApiPropertyOptional({ example: 2, description: 'ID del oficio solicitado' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'portafolioId debe ser un número entero' })
  @Min(1, { message: 'portafolioId debe ser mayor que cero' })
  portafolioId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del municipio' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'municipioId debe ser un número entero' })
  @Min(1, { message: 'municipioId debe ser mayor que cero' })
  municipioId?: number;

  @ApiPropertyOptional({ example: 3, description: 'ID de la zona' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'zonaId debe ser un número entero' })
  @Min(1, { message: 'zonaId debe ser mayor que cero' })
  zonaId?: number;

  @ApiPropertyOptional({ enum: Jornada, example: Jornada.TARDE })
  @IsOptional()
  @IsEnum(Jornada, { message: 'La jornada no es válida' })
  jornada?: Jornada;

  @ApiPropertyOptional({ example: 4, minimum: 0, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'calificacionMinima debe ser numérica' })
  @Min(0, { message: 'calificacionMinima no puede ser menor que cero' })
  @Max(5, { message: 'calificacionMinima no puede ser mayor que cinco' })
  calificacionMinima?: number;

  @ApiPropertyOptional({ example: 1, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page debe ser un número entero' })
  @Min(1, { message: 'page debe ser mayor que cero' })
  page = 1;

  @ApiPropertyOptional({ example: 10, default: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit debe ser un número entero' })
  @Min(1, { message: 'limit debe ser mayor que cero' })
  @Max(50, { message: 'limit no puede ser mayor que 50' })
  limit = 10;
}
