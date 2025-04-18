import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: jest.fn().mockReturnValue('Hello from Soother Finance!'),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('root', () => {
    it('should return welcome message from the service', () => {
      // Arrange
      const expected = 'Hello from Soother Finance!';

      // Act
      const result = appController.getHello();

      // Assert
      expect(result).toBe(expected);
      expect(appService.getHello).toHaveBeenCalledTimes(1);
    });
  });
});
