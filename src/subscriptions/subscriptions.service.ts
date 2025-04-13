import { Injectable } from '@nestjs/common';
import { BlockchainService } from 'src/common/blockchain.service';
import { SubscriptionManagementABI } from 'src/common/contract-abis';
import { SupabaseService } from 'src/common/supabase.service';

// Define required constants
const SUBSCRIPTION_MANAGER_ADDRESS =
  process.env.SUBSCRIPTION_MANAGER_ADDRESS ||
  '0x0000000000000000000000000000000000000000';
const ONE_YEAR_SECONDS = 31536000; // 365 days in seconds

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async generateTxData(oracleAddress: string, duration: number) {
    const subscriptionManager = this.blockchainService.getContract(
      process.env.SUBSCRIPTION_MANAGER_ADDRESS,
      SubscriptionManagementABI,
    );

    const price = await subscriptionManager.subscriptionPrices(oracleAddress);
    const value = price.mul(duration).div(ONE_YEAR_SECONDS);

    return {
      to: process.env.SUBSCRIPTION_MANAGER_ADDRESS,
      data: subscriptionManager.interface.encodeFunctionData(
        'purchaseSubscription',
        [oracleAddress, duration],
      ),
      value: value.toString(),
    };
  }

  async getActiveSubscriptions(address: string) {
    const allOracles = await this.supabaseService.findAggregators();
    const subscriptionManager = this.blockchainService.getContract(
      process.env.SUBSCRIPTION_MANAGER_ADDRESS,
      SubscriptionManagementABI,
    );

    const activeSubscriptions = await Promise.all(
      allOracles.map(async (oracle) => {
        const isActive = await subscriptionManager.isActiveSubscription(
          address,
          oracle.contractAddress,
        );
        if (!isActive) return null;

        const expiry = await this.getSubscriptionExpiry(
          oracle.contractAddress,
          address,
        );
        return {
          ...oracle,
          expiryDate: new Date(Number(expiry) * 1000),
        };
      }),
    );

    return activeSubscriptions.filter(Boolean);
  }

  async getSubscriptionPrice(oracleAddress: string) {
    const subscriptionManager = this.blockchainService.getContract(
      process.env.SUBSCRIPTION_MANAGER_ADDRESS,
      SubscriptionManagementABI,
    );

    const price = await subscriptionManager.subscriptionPrices(oracleAddress);
    return price.toString();
  }

  async getSubscriptionExpiry(oracleAddress: string, subscriber: string) {
    const subscriptionManager = this.blockchainService.getContract(
      process.env.SUBSCRIPTION_MANAGER_ADDRESS,
      SubscriptionManagementABI,
    );

    const expiry = await subscriptionManager.subscriptions(
      oracleAddress,
      subscriber,
    );
    return expiry.toString();
  }
}
