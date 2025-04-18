import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionController } from './subscriptions.controller';
import { SubscriptionService } from './subscriptions.service';

describe('SubscriptionController', () => {
  let controller: SubscriptionController;
  let subscriptionService: SubscriptionService;

  const mockSubscriptionService = {
    generateTxData: jest.fn(),
    getActiveSubscriptions: jest.fn(),
    getSubscriptionPrice: jest.fn(),
    getSubscriptionExpiry: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionController],
      providers: [
        {
          provide: SubscriptionService,
          useValue: mockSubscriptionService,
        },
      ],
    }).compile();

    controller = module.get<SubscriptionController>(SubscriptionController);
    subscriptionService = module.get<SubscriptionService>(SubscriptionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('purchaseSubscription', () => {
    it('should generate transaction data for subscription purchase', async () => {
      const dto = { oracleAddress: '0x123', duration: 31536000 };
      const expectedResult = {
        to: '0x456',
        data: '0x789',
        value: '1000000000000000000',
      };

      mockSubscriptionService.generateTxData.mockResolvedValue(expectedResult);

      const result = await controller.purchaseSubscription(dto);
      expect(result).toEqual(expectedResult);
      expect(mockSubscriptionService.generateTxData).toHaveBeenCalledWith(
        dto.oracleAddress,
        dto.duration,
      );
    });
  });

  describe('getActiveSubscriptions', () => {
    it('should return active subscriptions for an address', async () => {
      const address = '0x123';
      const expectedSubscriptions = [
        { oracleAddress: '0x456', expiryTime: 1234567890 },
      ];

      mockSubscriptionService.getActiveSubscriptions.mockResolvedValue(
        expectedSubscriptions,
      );

      const result = await controller.getActiveSubscriptions(address);
      expect(result).toEqual(expectedSubscriptions);
      expect(
        mockSubscriptionService.getActiveSubscriptions,
      ).toHaveBeenCalledWith(address);
    });
  });

  describe('getSubscriptionPrice', () => {
    it('should return subscription price for an oracle', async () => {
      const oracleAddress = '0x123';
      const expectedPrice = '1000000000000000000';

      mockSubscriptionService.getSubscriptionPrice.mockResolvedValue(
        expectedPrice,
      );

      const result = await controller.getSubscriptionPrice(oracleAddress);
      expect(result).toEqual(expectedPrice);
      expect(mockSubscriptionService.getSubscriptionPrice).toHaveBeenCalledWith(
        oracleAddress,
      );
    });
  });

  describe('getSubscriptionExpiry', () => {
    it('should return subscription expiry time', async () => {
      const oracleAddress = '0x123';
      const subscriber = '0x456';
      const expectedExpiry = 1234567890;

      mockSubscriptionService.getSubscriptionExpiry.mockResolvedValue(
        expectedExpiry,
      );

      const result = await controller.getSubscriptionExpiry(
        oracleAddress,
        subscriber,
      );
      expect(result).toEqual(expectedExpiry);
      expect(
        mockSubscriptionService.getSubscriptionExpiry,
      ).toHaveBeenCalledWith(oracleAddress, subscriber);
    });
  });
});
