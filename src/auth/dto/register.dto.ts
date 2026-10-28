import { CreateUserDto } from '../../user/dto/create-user.dto';
import { IsIn } from 'class-validator';
import { UserRole } from '../../user/entities/user.entity';

// El registro pide los mismos datos que la creación de usuario:
// se reutilizan las validaciones de CreateUserDto
export class RegisterDto extends CreateUserDto {
  @IsIn([UserRole.CLIENTE, UserRole.TRABAJADOR], {
    message: 'El rol de registro debe ser cliente o trabajador',
  })
  declare role?: UserRole;
}
