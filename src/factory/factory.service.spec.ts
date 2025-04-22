import { Test, TestingModule } from '@nestjs/testing';
import { FactoryService } from './factory.service';
import { BlockchainService } from '../common/blockchain.service';
import { SupabaseService } from '../common/supabase.service';

describe('FactoryService', () => {
  let service: FactoryService;
  let blockchainService: BlockchainService;
  let supabaseService: SupabaseService;

  const mockContract = {
    getAddress: jest.fn().mockResolvedValue('0x456'),
    setSubscriptionPrice: jest.fn().mockResolvedValue({}),
  };

  const mockBlockchainService = {
    deployContract: jest.fn().mockResolvedValue(mockContract),
    getContract: jest.fn().mockReturnValue(mockContract),
  };

  const mockSupabaseService = {
    createAggregator: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FactoryService,
        {
          provide: BlockchainService,
          useValue: mockBlockchainService,
        },
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<FactoryService>(FactoryService);
    blockchainService = module.get<BlockchainService>(BlockchainService);
    supabaseService = module.get<SupabaseService>(SupabaseService);

    process.env.SUBSCRIPTION_MANAGER_ADDRESS = '0x789';
    process.env.DEFAULT_AGGREGATOR_ADDRESS = '0xabc';
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deployNewAggregator', () => {
    it('should deploy a new aggregator and save to database', async () => {
      const dto = {
        oracleType: 1,
        subscriptionPrice: '1000000000000000000',
        sourceAPI: 'https://api.example.com',
        owner: '0x123',
      };

      mockSupabaseService.createAggregator.mockResolvedValue({
        id: 1,
        contractAddress: '0x456',
        oracleType: 1,
        sourceAPI: 'https://api.example.com',
        owner: '0x123',
        subscriptionPrice: parseFloat(dto.subscriptionPrice),
        lastUpdated: new Date(),
      });

      const result = await service.deployNewAggregator(dto);

      expect(mockBlockchainService.deployContract).toHaveBeenCalledWith(
        'EACAggregatorProxy',
        [
          process.env.DEFAULT_AGGREGATOR_ADDRESS,
          process.env.SUBSCRIPTION_MANAGER_ADDRESS,
          dto.oracleType,
        ],
      );

      expect(mockContract.setSubscriptionPrice).toHaveBeenCalledWith(
        '0x456',
        dto.subscriptionPrice,
      );

      expect(mockSupabaseService.createAggregator).toHaveBeenCalledWith({
        contractAddress: '0x456',
        oracleType: dto.oracleType,
        sourceAPI: dto.sourceAPI,
        owner: dto.owner,
        subscriptionPrice: parseFloat(dto.subscriptionPrice),
        lastUpdated: new Date(),
      });

      expect(result).toEqual({
        id: 1,
        contractAddress: '0x456',
        oracleType: 1,
        sourceAPI: 'https://api.example.com',
        owner: '0x123',
        subscriptionPrice: '1000000000000000000',
        lastUpdated: new Date(),
      });
    });

    it('should throw error if subscription manager address is not configured', async () => {
      process.env.SUBSCRIPTION_MANAGER_ADDRESS = '';

      const dto = {
        oracleType: 1,
        subscriptionPrice: '1000000000000000000',
        sourceAPI: 'https://api.example.com',
        owner: '0x123',
        lastUpdated: new Date(),
        currentPrice: '100000000',
      };

      await expect(service.deployNewAggregator(dto)).rejects.toThrow(
        'Subscription manager address not configured',
      );
    });
  });
});
