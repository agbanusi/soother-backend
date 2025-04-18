import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionService } from './subscriptions.service';
import { BlockchainService } from '../common/blockchain.service';
import { SupabaseService } from '../common/supabase.service';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let blockchainService: BlockchainService;
  let supabaseService: SupabaseService;

  const mockContract = {
    subscriptionPrices: jest.fn(),
    interface: {
      encodeFunctionData: jest.fn(),
    },
    isActiveSubscription: jest.fn(),
    subscriptionExpiry: jest.fn(),
  };

  const mockBlockchainService = {
    getContract: jest.fn().mockReturnValue(mockContract),
  };

  const mockSupabaseService = {
    findAggregators: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
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

    service = module.get<SubscriptionService>(SubscriptionService);
    blockchainService = module.get<BlockchainService>(BlockchainService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateTxData', () => {
    it('should generate transaction data for subscription purchase', async () => {
      const oracleAddress = '0x123';
      const duration = 31536000; // 1 year
      const price = {
        mul: jest.fn().mockReturnThis(),
        div: jest.fn().mockReturnValue('1000000000000000000'),
      };

      mockContract.subscriptionPrices.mockResolvedValue(price);
      mockContract.interface.encodeFunctionData.mockReturnValue('0x789');

      const result = await service.generateTxData(oracleAddress, duration);

      expect(result).toEqual({
        to: process.env.SUBSCRIPTION_MANAGER_ADDRESS,
        data: '0x789',
        value: '1000000000000000000',
      });
    });
  });

  describe('getActiveSubscriptions', () => {
    it('should return active subscriptions', async () => {
      const address = '0x123';
      const oracles = [
        { contractAddress: '0x456' },
        { contractAddress: '0x789' },
      ];

      mockSupabaseService.findAggregators.mockResolvedValue(oracles);
      mockContract.isActiveSubscription
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      mockContract.subscriptionExpiry.mockResolvedValueOnce(1234567890);

      const result = await service.getActiveSubscriptions(address);

      expect(result).toEqual([
        {
          oracleAddress: '0x456',
          expiryTime: 1234567890,
        },
      ]);
    });
  });

  describe('getSubscriptionPrice', () => {
    it('should return subscription price for an oracle', async () => {
      const oracleAddress = '0x123';
      const price = { toString: () => '1000000000000000000' };

      mockContract.subscriptionPrices.mockResolvedValue(price);

      const result = await service.getSubscriptionPrice(oracleAddress);

      expect(result).toBe('1000000000000000000');
    });
  });

  describe('getSubscriptionExpiry', () => {
    it('should return subscription expiry time', async () => {
      const oracleAddress = '0x123';
      const subscriber = '0x456';
      const expiry = { toNumber: () => 1234567890 };

      mockContract.subscriptionExpiry.mockResolvedValue(expiry);

      const result = await service.getSubscriptionExpiry(
        oracleAddress,
        subscriber,
      );

      expect(result).toBe(1234567890);
    });
  });
});
