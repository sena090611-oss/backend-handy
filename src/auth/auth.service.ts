import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { User, UserStatus } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import {
  AuthResponse,
  RegisterResponse,
} from './interfaces/auth-response.interface';
import { ChangePasswordDto } from './dto/change-password.dto';

// Hash bcrypt falso (de una credencial inexistente). Se usa cuando el email
// no existe para ejecutar bcrypt.compare igualmente y que el tiempo de
// respuesta sea similar, evitando enumerar usuarios válidos por timing.
const BCRYPT_HASH_FALSO =
  '$2b$10$sDiIDnW8owzvJ84HvFMFnuXmuAb1xot2CzWxeT1s4H3.h/fFgykO6';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registrar un nuevo usuario
   * Crea una cuenta pendiente de aprobación
   */
  async register(registerDto: RegisterDto): Promise<RegisterResponse> {
    // Crear el usuario usando el servicio de usuarios
    const user: User = await this.userService.create(registerDto);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
      },
      message: 'Cuenta creada y pendiente de aprobación por un administrador',
    };
  }

  /**
   * Login de usuario
   * Valida credenciales y retorna un token JWT
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Buscar usuario por email (incluye password); puede ser null
    const user: User | null = await this.userService.findOneByEmail(email);

    // Verificar si el usuario existe. Si no existe, se ejecuta igualmente una
    // comparación bcrypt contra un hash falso para igualar el tiempo de
    // respuesta y no revelar por timing si el email está registrado.
    if (!user) {
      await bcrypt.compare(password, BCRYPT_HASH_FALSO);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Comparar contraseñas
    const isPasswordValid: boolean = await bcrypt.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar si el usuario está activo (después de validar la contraseña,
    // para no revelar el estado de cuentas ajenas)
    if (user.isActive !== UserStatus.ACTIVO) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    return await this.buildAuthResponse(user);
  }

  async changePassword(
    user: User,
    dto: ChangePasswordDto,
  ): Promise<void> {
    await this.userService.changePassword(
      user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  /**
   * Validar un token manualmente y retornar el usuario
   * (útil, por ejemplo, para WebSockets)
   */
  async validateToken(token: string): Promise<User> {
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const user: User | null = await this.userService.findById(payload.sub);

    if (!user || user.isActive !== UserStatus.ACTIVO) {
      throw new UnauthorizedException('Token inválido');
    }

    return user;
  }

  /**
   * Generar token JWT con el payload del usuario
   */
  private async generateToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Firmar y retornar el token
    return await this.jwtService.signAsync(payload);
  }

  /**
   * Construir la respuesta de register/login (sin la contraseña)
   */
  private async buildAuthResponse(user: User): Promise<AuthResponse> {
    const token: string = await this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      token,
    };
  }
}