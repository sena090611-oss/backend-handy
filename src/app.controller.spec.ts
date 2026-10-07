import { Test, TestingModule } from '@nestjs/testing';
import * as AppControllerModule from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: any;
  const AppController = (AppControllerModule as any).AppController ?? (AppControllerModule as any).default;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
