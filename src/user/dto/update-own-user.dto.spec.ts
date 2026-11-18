import { ValidationPipe } from '@nestjs/common';
import { UpdateOwnUserDto } from './update-own-user.dto';

describe('UpdateOwnUserDto', () => {
  const validationPipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  it.each(['email', 'role', 'isActive', 'password'])(
    'rechaza el campo no editable %s',
    async (field) => {
      await expect(
        validationPipe.transform(
          { [field]: 'valor' },
          { type: 'body', metatype: UpdateOwnUserDto },
        ),
      ).rejects.toThrow();
    },
  );
});
