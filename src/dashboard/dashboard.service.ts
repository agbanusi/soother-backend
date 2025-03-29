import { Injectable } from '@nestjs/common';
import { BlockchainService } from 'src/common/blockchain.service';
import { SupabaseService } from 'src/common/supabase.service';
import { EACAggregatorProxyABI } from 'src/common/contract-abis';

@Injectable()
export class DashboardService {
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async getUserData(address: string) {
    const subscriptions = await this.getSubscriptions(address);

    return Promise.all(
      subscriptions.map(async (agg) => ({
        address: agg.contractAddress,
        latestData: await this.getLatestData(agg.contractAddress),
        sourceAPI: agg.sourceAPI,
        lastUpdated: agg.lastUpdated,
      })),
    );
  }

  private async getSubscriptions(address: string): Promise<any[]> {
    // Find subscriptions for the user from Supabase
    return this.supabaseService.findAggregatorsByOwner(address);
  }

  private async getLatestData(contractAddress: string) {
    const contract = this.blockchainService.getContract(
      contractAddress,
      EACAggregatorProxyABI,
    );
    return contract.latestRoundData();
  }
}
