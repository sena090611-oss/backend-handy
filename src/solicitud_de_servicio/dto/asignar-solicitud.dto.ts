import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AsignarSolicitudDto {
  @ApiProperty({ example: 3, description: 'ID del trabajador a asignar' })
  @IsInt({ message: 'trabajadorId debe ser un número entero' })
  @Min(1, { message: 'trabajadorId debe ser mayor que cero' })
  trabajadorId: number;
}
