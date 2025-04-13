import { Injectable } from '@nestjs/common';
import { BlockchainService } from 'src/common/blockchain.service';
import { SupabaseService } from 'src/common/supabase.service';
import {
  EACAggregatorProxyABI,
  SubscriptionManagementABI,
} from 'src/common/contract-abis';
import { OracleType } from 'src/factory/entities/aggregator.entity';

@Injectable()
export class DashboardService {
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async getUserData(address: string) {
    const [ownedOracles, subscribedOracles] = await Promise.all([
      this.getOwnedOracles(address),
      this.getSubscribedOracles(address),
    ]);

    return {
      ownedOracles: await this.enrichOracleData(ownedOracles),
      subscribedOracles: await this.enrichOracleData(subscribedOracles),
      stats: {
        totalOwnedOracles: ownedOracles.length,
        totalSubscriptions: subscribedOracles.length,
        activeOwnedOracles: ownedOracles.filter((o) => this.isOracleActive(o))
          .length,
        activeSubscriptions: subscribedOracles.filter((o) =>
          this.isOracleActive(o),
        ).length,
      },
    };
  }

  async getOracleStats(oracleAddress: string) {
    const contract = this.blockchainService.getContract(
      oracleAddress,
      EACAggregatorProxyABI,
    );

    const [latestData, aggregator] = await Promise.all([
      contract.latestRoundData(),
      this.supabaseService
        .findAggregators({ contractAddress: oracleAddress })
        .then((r) => r[0]),
    ]);

    return {
      currentPrice: latestData.answer.toString(),
      lastUpdate: new Date(Number(latestData.updatedAt) * 1000),
      updateFrequency: '5 minutes',
      type: OracleType[aggregator.oracleType],
      sourceAPI: aggregator.sourceAPI,
      owner: aggregator.owner,
      subscriptionPrice: aggregator.subscriptionPrice,
    };
  }

  async getOracleHistory(oracleAddress: string, limit = 10) {
    // This would be implemented with a separate table for historical data
    // For now, we'll return the latest data
    const contract = this.blockchainService.getContract(
      oracleAddress,
      EACAggregatorProxyABI,
    );
    const latestData = await contract.latestRoundData();

    return [
      {
        timestamp: new Date(Number(latestData.updatedAt) * 1000),
        price: latestData.answer.toString(),
        roundId: latestData.roundId.toString(),
      },
    ];
  }

  private async getOwnedOracles(address: string): Promise<any[]> {
    return this.supabaseService.findAggregatorsByOwner(address);
  }

  private async getSubscribedOracles(address: string): Promise<any[]> {
    const allOracles = await this.supabaseService.findAggregators();
    const subscriptionManager = this.blockchainService.getContract(
      process.env.SUBSCRIPTION_MANAGER_ADDRESS,
      SubscriptionManagementABI,
    );

    const subscribedOracles = await Promise.all(
      allOracles.map(async (oracle) => {
        const isSubscribed = await subscriptionManager.isActiveSubscription(
          address,
          oracle.contractAddress,
        );
        return isSubscribed ? oracle : null;
      }),
    );

    return subscribedOracles.filter(Boolean);
  }

  private async enrichOracleData(oracles: any[]) {
    return Promise.all(
      oracles.map(async (oracle) => {
        const latestData = await this.getLatestData(oracle.contractAddress);
        return {
          ...oracle,
          currentPrice: latestData.answer.toString(),
          lastUpdate: new Date(Number(latestData.updatedAt) * 1000),
          isActive: this.isOracleActive(oracle),
        };
      }),
    );
  }

  private async getLatestData(contractAddress: string) {
    const contract = this.blockchainService.getContract(
      contractAddress,
      EACAggregatorProxyABI,
    );
    return contract.latestRoundData();
  }

  private isOracleActive(oracle: any): boolean {
    const lastUpdate = new Date(oracle.lastUpdated);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastUpdate > fiveMinutesAgo;
  }
}
