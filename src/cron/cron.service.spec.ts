import { Test, TestingModule } from '@nestjs/testing';
import { CronService } from './cron.service';
import { BlockchainService } from '../common/blockchain.service';
import { SupabaseService } from '../common/supabase.service';

describe('CronService', () => {
  let service: CronService;
  let blockchainService: BlockchainService;
  let supabaseService: SupabaseService;

  const mockContract = {
    updatePrice: jest.fn().mockResolvedValue({
      wait: jest.fn().mockResolvedValue(true),
    }),
  };

  const mockBlockchainService = {
    getContract: jest.fn().mockReturnValue(mockContract),
  };

  const mockSupabaseService = {
    findAggregators: jest.fn(),
    updateAggregator: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CronService,
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

    service = module.get<CronService>(CronService);
    blockchainService = module.get<BlockchainService>(BlockchainService);
    supabaseService = module.get<SupabaseService>(SupabaseService);

    // Mock global fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ price: 100000000 }),
      }),
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateAggregators', () => {
    it('should update prices for all aggregators', async () => {
      const mockAggregators = [
        {
          id: 1,
          contractAddress: '0x456',
          oracleType: 1,
          sourceAPI: 'https://api.example.com',
          owner: '0x123',
        },
        {
          id: 2,
          contractAddress: '0x789',
          oracleType: 2,
          sourceAPI: 'https://api2.example.com',
          owner: '0x123',
        },
      ];

      mockSupabaseService.findAggregators.mockResolvedValue(mockAggregators);
      mockSupabaseService.updateAggregator.mockResolvedValue(true);

      await service.updateAggregators();

      expect(mockSupabaseService.findAggregators).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(mockContract.updatePrice).toHaveBeenCalledTimes(2);
      expect(mockSupabaseService.updateAggregator).toHaveBeenCalledTimes(2);
    });

    it('should handle API errors gracefully', async () => {
      const mockAggregators = [
        {
          id: 1,
          contractAddress: '0x456',
          oracleType: 1,
          sourceAPI: 'https://api.example.com',
          owner: '0x123',
        },
      ];

      mockSupabaseService.findAggregators.mockResolvedValue(mockAggregators);
      global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));

      await service.updateAggregators();

      expect(mockSupabaseService.findAggregators).toHaveBeenCalled();
      expect(mockContract.updatePrice).not.toHaveBeenCalled();
      expect(mockSupabaseService.updateAggregator).not.toHaveBeenCalled();
    });

    it('should handle contract update errors gracefully', async () => {
      const mockAggregators = [
        {
          id: 1,
          contractAddress: '0x456',
          oracleType: 1,
          sourceAPI: 'https://api.example.com',
          owner: '0x123',
        },
      ];

      mockSupabaseService.findAggregators.mockResolvedValue(mockAggregators);
      mockContract.updatePrice.mockRejectedValue(new Error('Contract Error'));

      await service.updateAggregators();

      expect(mockSupabaseService.findAggregators).toHaveBeenCalled();
      expect(mockContract.updatePrice).toHaveBeenCalled();
      expect(mockSupabaseService.updateAggregator).not.toHaveBeenCalled();
    });

    it('should extract price correctly based on oracle type', async () => {
      const mockAggregators = [
        {
          id: 1,
          contractAddress: '0x456',
          oracleType: 1, // PublicSubscribable
          sourceAPI: 'https://api.example.com',
          owner: '0x123',
        },
        {
          id: 2,
          contractAddress: '0x789',
          oracleType: 2, // PublicFree
          sourceAPI: 'https://api2.example.com',
          owner: '0x123',
        },
        {
          id: 3,
          contractAddress: '0xabc',
          oracleType: 3, // Private
          sourceAPI: 'https://api3.example.com',
          owner: '0x123',
        },
      ];

      mockSupabaseService.findAggregators.mockResolvedValue(mockAggregators);

      // Mock different API responses
      global.fetch = jest.fn().mockImplementation((url) => {
        const responses = {
          'https://api.example.com': { price: 100 },
          'https://api2.example.com': { value: 200 },
          'https://api3.example.com': { price: 300 },
        };
        return Promise.resolve({
          json: () => Promise.resolve(responses[url]),
        });
      });

      await service.updateAggregators();

      expect(mockContract.updatePrice).toHaveBeenCalledWith(100);
      expect(mockContract.updatePrice).toHaveBeenCalledWith(200);
      expect(mockContract.updatePrice).toHaveBeenCalledWith(300);
    });
  });
});
