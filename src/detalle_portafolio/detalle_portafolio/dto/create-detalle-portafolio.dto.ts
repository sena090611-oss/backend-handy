// Importa los validadores de datos que se usarán para revisar la información recibida.
import { IsInt, IsString, Length, Max, Min } from 'class-validator';
// Importa la anotación de Swagger para documentar la estructura del DTO en la API.
import { ApiProperty } from '@nestjs/swagger';

// Este DTO define los datos requeridos para crear un registro de detalle de portafolio.
export class CreateDetallePortafolioDto {
  // Identificador del trabajador que realiza o registra este detalle dentro del portafolio.
  @ApiProperty({ example: 3, description: 'ID del trabajador propietario' })
  // Debe ser un número entero y mayor a 0.
  @IsInt({ message: 'El ID del trabajador debe ser un número entero' })
  @Min(1, { message: 'El ID del trabajador debe ser mayor que cero' })
  trabajadorId: number;

  // Identificador del portafolio o oficio asociado a este detalle.
  @ApiProperty({ example: 2, description: 'ID del oficio en el portafolio' })
  // Debe ser un número entero válido y positivo.
  @IsInt({ message: 'El ID del portafolio debe ser un número entero' })
  @Min(1, { message: 'El ID del portafolio debe ser mayor que cero' })
  portafolioId: number;

  // Cantidad de años de experiencia relacionada con el trabajo o oficio.
  @ApiProperty({ example: 5, minimum: 0, maximum: 60 })
  // Debe ser un entero entre 0 y 60 años.
  @IsInt({ message: 'Los años de experiencia deben ser un número entero' })
  @Min(0, { message: 'Los años de experiencia no pueden ser negativos' })
  @Max(60, { message: 'Los años de experiencia no pueden superar 60' })
  aniosExperiencia: number;

  // Descripción breve de los trabajos realizados o actividades que se destacan.
  @ApiProperty({ example: 'Instalación de griferías y reparación de tuberías.' })
  // Debe ser texto con una longitud mínima y máxima definida.
  @IsString({ message: 'La descripción de trabajos debe ser texto' })
  @Length(1, 200, {
    message: 'La descripción de trabajos debe tener entre 1 y 200 caracteres',
  })
  descripcionTrabajos: string;
}
