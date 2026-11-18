import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Municipio } from '../municipio/entities/municipio.entity';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

describe('UserService.changePassword', () => {
  const userRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };
  const municipioRepository = {};
  const service = new UserService(
    userRepository as unknown as Repository<User>,
    municipioRepository as unknown as Repository<Municipio>,
  );
  let currentHash: string;

  beforeAll(async () => {
    currentHash = await bcrypt.hash('Actual1234', 4);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rechaza una contraseña actual incorrecta y no guarda cambios', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 4,
      password: currentHash,
    });

    await expect(
      service.changePassword(4, 'Incorrecta123', 'NuevaClave123'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('verifica la contraseña actual y guarda únicamente el hash nuevo', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 4,
      password: currentHash,
    });
    userRepository.save.mockImplementation(async (user: User) => user);

    await service.changePassword(4, 'Actual1234', 'NuevaClave123');

    const guardado = userRepository.save.mock.calls[0][0] as User;
    expect(guardado.password).not.toBe('NuevaClave123');
    await expect(
      bcrypt.compare('NuevaClave123', guardado.password),
    ).resolves.toBe(true);
  });
});
