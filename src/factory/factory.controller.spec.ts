import { Test, TestingModule } from '@nestjs/testing';
import { FactoryController } from './factory.controller';
import { FactoryService } from './factory.service';

describe('FactoryController', () => {
  let controller: FactoryController;
  let factoryService: FactoryService;

  const mockFactoryService = {
    deployNewAggregator: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FactoryController],
      providers: [
        {
          provide: FactoryService,
          useValue: mockFactoryService,
        },
      ],
    }).compile();

    controller = module.get<FactoryController>(FactoryController);
    factoryService = module.get<FactoryService>(FactoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('deployAggregator', () => {
    it('should deploy a new aggregator', async () => {
      const dto = {
        oracleType: 1,
        subscriptionPrice: '1000000000000000000',
        sourceAPI: 'https://api.example.com',
        owner: '0x123',
      };

      const expectedResult = {
        contractAddress: '0x456',
        transactionHash: '0x789',
      };

      mockFactoryService.deployNewAggregator.mockResolvedValue(expectedResult);

      const result = await controller.deployAggregator(dto);

      expect(result).toEqual(expectedResult);
      expect(mockFactoryService.deployNewAggregator).toHaveBeenCalledWith(dto);
    });
  });
});
