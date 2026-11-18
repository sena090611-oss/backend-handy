import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole, UserStatus } from '../user/entities/user.entity';

describe('AuthService', () => {
  const userService = {
    findOneByEmail: jest.fn(),
    changePassword: jest.fn(),
  };
  const jwtService = {
    signAsync: jest.fn().mockResolvedValue('test-token'),
  };
  const service = new AuthService(
    userService as unknown as UserService,
    jwtService as unknown as JwtService,
  );
  const email = 'cliente@example.test';
  const password = 'TestPassword123!';
  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash(password, 4);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inicia sesión con credenciales correctas', async () => {
    const user = {
      id: 7,
      email,
      fullName: 'Cliente de prueba',
      password: passwordHash,
      role: UserRole.CLIENTE,
      isActive: UserStatus.ACTIVO,
    } as User;
    userService.findOneByEmail.mockResolvedValue(user);

    await expect(service.login({ email, password })).resolves.toEqual({
      user: {
        id: user.id,
        email,
        fullName: user.fullName,
        role: UserRole.CLIENTE,
      },
      token: 'test-token',
    });
    expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
  });

  it('rechaza una contraseña incorrecta', async () => {
    userService.findOneByEmail.mockResolvedValue({
      id: 7,
      email,
      password: passwordHash,
      isActive: UserStatus.ACTIVO,
    } as User);

    await expect(
      service.login({ email, password: 'Incorrecta123!' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('rechaza un usuario inactivo', async () => {
    userService.findOneByEmail.mockResolvedValue({
      id: 7,
      email,
      password: passwordHash,
      isActive: UserStatus.PENDIENTE,
    } as User);

    await expect(service.login({ email, password })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('rechaza un usuario inexistente', async () => {
    userService.findOneByEmail.mockResolvedValue(null);

    await expect(service.login({ email, password })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('delega el cambio de contraseña del usuario autenticado', async () => {
    const user = { id: 7 } as User;
    const dto = {
      currentPassword: password,
      newPassword: 'NuevaClave123',
    };
    userService.changePassword.mockResolvedValue(undefined);

    await expect(service.changePassword(user, dto)).resolves.toBeUndefined();
    expect(userService.changePassword).toHaveBeenCalledWith(
      user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  });
});
