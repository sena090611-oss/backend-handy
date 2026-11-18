import { cumplePoliticaPassword } from './password-policy';
import { validate } from 'class-validator';
import { CreateUserDto } from './dto/create-user.dto';

describe('cumplePoliticaPassword', () => {
  it('requiere al menos ocho caracteres', () => {
    expect(cumplePoliticaPassword('abc1234')).toBe(false);
  });

  it('requiere al menos una letra y un número', () => {
    expect(cumplePoliticaPassword('abcdefgh')).toBe(false);
    expect(cumplePoliticaPassword('12345678')).toBe(false);
    expect(cumplePoliticaPassword('Clave123')).toBe(true);
  });

  it('aplica la política en el DTO de creación de usuarios', async () => {
    const user = Object.assign(new CreateUserDto(), {
      email: 'cliente@example.test',
      nombre: 'Cliente',
      id_municipio: 1,
      password: 'abcdefgh',
    });

    const errors = await validate(user);
    const passwordError = errors.find((error) => error.property === 'password');
    expect(passwordError?.constraints).toHaveProperty('matches');
  });
});
