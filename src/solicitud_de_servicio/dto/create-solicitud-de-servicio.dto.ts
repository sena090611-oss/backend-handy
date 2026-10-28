// DTO (Data Transfer Object) para crear una SolicitudDeServicio.
// Utiliza decoradores de class‑validator para validar los datos de entrada.
import { IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateSolicitudDeServicioDto {
  // Identificador del usuario que realiza la solicitud.
  @IsInt({ message: 'id_usuario debe ser un número entero' }) // debe ser entero.
  @IsNotEmpty({ message: 'id_usuario es obligatorio' }) // campo requerido.
  id_usuario: number;

  // Texto descriptivo de la solicitud.
  @IsString({ message: 'descripcion debe ser una cadena de texto' }) // debe ser string.
  @IsNotEmpty({ message: 'descripcion es obligatoria' }) // obligatorio.
  @MinLength(5, { message: 'descripcion debe tener al menos 5 caracteres' }) // longitud mínima.
  descripcion: string;
}