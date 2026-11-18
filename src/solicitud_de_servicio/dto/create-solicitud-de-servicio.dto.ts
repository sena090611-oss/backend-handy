// DTO (Data Transfer Object) para crear una SolicitudDeServicio.
// Utiliza decoradores de class‑validator para validar los datos de entrada.
// El dueño de la solicitud se obtiene del token JWT, no del cuerpo.
import {
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSolicitudDeServicioDto {
  // Texto descriptivo de la solicitud.
  @ApiProperty({ example: 'Necesito reparar una fuga en la cocina.' })
  @IsString({ message: 'descripcion debe ser una cadena de texto' }) // debe ser string.
  @IsNotEmpty({ message: 'descripcion es obligatoria' }) // obligatorio.
  @MinLength(5, { message: 'descripcion debe tener al menos 5 caracteres' }) // longitud mínima.
  descripcion: string;

  // Dirección donde se realizará el servicio (obligatoria al crear).
  @ApiProperty({ example: 'Calle 45 # 23-10, Barrio Centro' })
  @IsString({ message: 'direccionServicio debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'direccionServicio es obligatoria' })
  @MaxLength(200, {
    message: 'direccionServicio debe tener máximo 200 caracteres',
  })
  direccionServicio: string;

  // Fecha y hora del servicio (obligatoria al crear). No puede ser en el
  // pasado: se valida además en el servicio para rechazar fechas antiguas.
  @ApiProperty({
    example: '2026-11-25T10:00:00.000Z',
    format: 'date-time',
    description: 'Fecha y hora del servicio; no puede ser en el pasado',
  })
  @IsNotEmpty({ message: 'fechaServicio es obligatoria' })
  @IsISO8601(
    {},
    {
      message:
        'fechaServicio debe ser una fecha ISO 8601 válida (p. ej. 2026-11-25T10:00:00Z)',
    },
  )
  fechaServicio: string;

  // Oficio solicitado: ID del portafolio de servicios (obligatorio al crear).
  @ApiProperty({
    example: 2,
    description: 'ID del portafolio (oficio) solicitado',
  })
  @IsInt({ message: 'portafolioId debe ser un número entero' })
  @Min(1, { message: 'portafolioId debe ser mayor que cero' })
  portafolioId: number;
}
