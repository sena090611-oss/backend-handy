// Resumen público del portafolio (oficio) asociado a una solicitud.
// Información pública de negocio: no expone datos personales.
import { ApiProperty } from '@nestjs/swagger';

export class PortafolioResumenDto {
  @ApiProperty({ example: 2 })
  id: number;

  @ApiProperty({ example: 'Plomería' })
  nombreOficio: string;

  @ApiProperty({ example: 'Mantenimiento del hogar' })
  categoria: string;
}
