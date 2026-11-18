import { IsNotEmpty, IsString, IsInt, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para crear un reporte de incidente.
 * El autor (`reportadoPor`) y el estado inicial (`ABIERTO`) se derivan en el
 * servicio: nunca se aceptan desde el cuerpo de la petición.
 */
export class CreateReporteIncidenteDto {
  @ApiProperty({ example: 'El trabajador no se presentó en el horario acordado.' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  descripcion: string;

  @ApiProperty({ example: 12, description: 'ID de la solicitud relacionada' })
  @IsNotEmpty()
  @IsInt()
  solicitudId: number;
}
