import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { SupabaseService } from '../common/supabase.service';
import { BlockchainService } from '../common/blockchain.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let blockchainService: BlockchainService;
  let supabaseService: SupabaseService;

  const mockContract = {
    latestRoundData: jest.fn().mockResolvedValue({
      answer: '100000000',
      updatedAt: '1700000000',
      roundId: '1',
    }),
    isActiveSubscription: jest.fn().mockResolvedValue(true),
  };

  const mockBlockchainService = {
    getContract: jest.fn().mockReturnValue(mockContract),
  };

  const mockSupabaseService = {
    findAggregators: jest.fn(),
    findAggregatorsByOwner: jest.fn(),
    updateAggregator: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
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

    service = module.get<DashboardService>(DashboardService);
    blockchainService = module.get<BlockchainService>(BlockchainService);
    supabaseService = module.get<SupabaseService>(SupabaseService);

    process.env.SUBSCRIPTION_MANAGER_ADDRESS = '0x789';
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserData', () => {
    it('should return user dashboard data with owned and subscribed oracles', async () => {
      const address = '0x123';
      const mockOracles = [
        {
          id: 1,
          contractAddress: '0x456',
          oracleType: 1,
          sourceAPI: 'https://api.example.com',
          owner: '0x123',
          subscriptionPrice: '1000000000000000000',
          isActive: true,
          lastUpdated: expect.any(Date),
          currentPrice: '100000000',
        },
      ];

      mockSupabaseService.findAggregatorsByOwner.mockResolvedValue(mockOracles);
      mockSupabaseService.findAggregators.mockResolvedValue(mockOracles);
      // skip 5 minutes time
      jest.useFakeTimers();
      jest.setSystemTime(new Date(Date.now() + 10 * 60 * 1000));

      const result = await service.getUserData(address);

      expect(result).toEqual({
        ownedOracles: expect.arrayContaining([
          expect.objectContaining(mockOracles[0]),
        ]),
        subscribedOracles: expect.arrayContaining([
          expect.objectContaining(mockOracles[0]),
        ]),
        stats: {
          totalOwnedOracles: 1,
          totalSubscriptions: 1,
          activeOwnedOracles: 1,
          activeSubscriptions: 1,
        },
      });
    });
  });

  describe('getOracleStats', () => {
    it('should return oracle statistics', async () => {
      const oracleAddress = '0x456';
      const mockAggregator = {
        id: 1,
        contractAddress: oracleAddress,
        oracleType: 1,
        sourceAPI: 'https://api.example.com',
        owner: '0x123',
        subscriptionPrice: '1000000000000000000',
        lastUpdated: expect.any(Date),
        currentPrice: '100000000',
      };

      mockSupabaseService.findAggregators.mockResolvedValue([mockAggregator]);

      const result = await service.getOracleStats(oracleAddress);

      expect(result).toEqual({
        currentPrice: '100000000',
        lastUpdate: expect.any(Date),
        updateFrequency: '5 minutes',
        type: 'PublicFree',
        sourceAPI: 'https://api.example.com',
        owner: '0x123',
        subscriptionPrice: '1000000000000000000',
      });
    });
  });

  describe('getOracleHistory', () => {
    it('should return oracle price history', async () => {
      const oracleAddress = '0x456';
      const limit = 10;

      const result = await service.getOracleHistory(oracleAddress, limit);

      expect(result).toEqual([
        {
          timestamp: expect.any(Date),
          price: '100000000',
          roundId: '1',
        },
      ]);
    });
  });
});
