import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import {
  AuthResponse,
  RegisterResponse,
} from './interfaces/auth-response.interface';
import { User } from '../user/entities/user.entity';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Autenticación')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Registrar un nuevo usuario (responde 201 Created)
   */
  @Post('register')
  @ApiCreatedResponse({
    schema: {
      example: {
        user: {
          id: 8,
          email: 'juan.gomez@handy.com',
          fullName: 'Juan Gómez',
          role: 'trabajador',
          isActive: 'pendiente',
        },
        message: 'Cuenta creada y pendiente de aprobación por un administrador',
      },
    },
  })
  register(@Body() registerDto: RegisterDto): Promise<RegisterResponse> {
    return this.authService.register(registerDto);
  }

  /**
   * POST /auth/login
   * Iniciar sesión (responde 200 OK, no se crea ningún recurso)
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    schema: {
      example: {
        user: {
          id: 5,
          email: 'cliente@handy.com',
          fullName: 'María Pérez',
          role: 'cliente',
        },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  /**
   * GET /auth/profile
   * Obtener perfil del usuario autenticado
   * Ruta protegida con JWT
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOkResponse({
    schema: {
      example: {
        user: {
          id: 5,
          email: 'cliente@handy.com',
          fullName: 'María Pérez',
          isActive: 'activo',
          role: 'cliente',
        },
      },
    },
  })
  getProfile(@GetUser() user: User): { user: User } {
    return { user };
  }
}