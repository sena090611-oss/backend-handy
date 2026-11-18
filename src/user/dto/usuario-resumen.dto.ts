// DTO de resumen de usuario. Es lo único que se expone de un usuario a su
// contraparte (cliente ↔ trabajador). Nunca incluye email, municipio ni
// ningún otro dato personal.
import { ApiProperty } from '@nestjs/swagger';

export class UsuarioResumenDto {
  @ApiProperty({ example: 5 })
  id: number;

  @ApiProperty({ example: 'María Pérez' })
  fullName: string;
}
