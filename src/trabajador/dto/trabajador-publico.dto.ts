// DTO público del trabajador. No incluye datos de contacto ni documentos.
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NivelFormacion } from '../entities/trabajador.entity';

// Oficio del portafolio visible en el perfil público del trabajador.
export class OficioPublicoDto {
  @ApiProperty({ example: 4 })
  id: number;

  @ApiProperty({ example: 'Plomería' })
  nombreOficio: string;

  @ApiProperty({ example: 'Mantenimiento del hogar' })
  categoria: string;

  @ApiProperty({ example: 'Instalación de griferías y reparación de tuberías.' })
  descripcionTrabajos: string;

  @ApiProperty({ example: 5 })
  aniosExperiencia: number;
}

export class TrabajadorPublicoDto {
  @ApiProperty({ example: 3 })
  id: number;

  @ApiProperty({ example: 'Juan' })
  nombres: string;

  // Inicial del apellido (ejemplo: "G."), para no exponer el nombre completo.
  @ApiProperty({ example: 'G.' })
  apellidoInicial: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  foto: string | null;

  @ApiProperty({ enum: NivelFormacion, example: NivelFormacion.TECNICO })
  nivelFormacion: NivelFormacion;

  @ApiProperty({ example: 'Montería' })
  municipio: string | null;

  @ApiProperty({ example: 'La Castellana' })
  zona: string | null;

  @ApiProperty({ example: 4.5 })
  promedioCalificacion: number;

  @ApiProperty({ type: [OficioPublicoDto] })
  oficios: OficioPublicoDto[];
}
