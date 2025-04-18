import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../common/blockchain.service';
import { SupabaseService } from '../common/supabase.service';
import { Cron } from '@nestjs/schedule';
import { EACAggregatorProxyABI } from '../common/contract-abis';
import { OracleType } from '../factory/entities/aggregator.entity';

@Injectable()
export class CronService {
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Cron('*/5 * * * *') // Every 5 minutes
  async updateAggregators() {
    const aggregators = await this.supabaseService.findAggregators();

    for (const agg of aggregators) {
      try {
        const contract = this.blockchainService.getContract(
          agg.contractAddress,
          EACAggregatorProxyABI,
        );

        // Fetch latest price from source API
        const response = await fetch(agg.sourceAPI);
        const data = await response.json();
        const price = this.extractPriceFromResponse(data, agg.oracleType);

        // Update the price on-chain
        const tx = await contract.updatePrice(price);
        await tx.wait();

        // Update the lastUpdated timestamp in Supabase
        await this.supabaseService.updateAggregator(agg.id, {
          lastUpdated: new Date().toISOString(),
        });

        console.log(`Updated price for ${agg.contractAddress}: ${price}`);
      } catch (error) {
        console.error(
          `Failed to update ${agg.contractAddress}: ${error.message}`,
        );
      }
    }
  }

  private extractPriceFromResponse(data: any, oracleType: number): number {
    // Convert numeric oracle type to appropriate data extraction strategy
    switch (oracleType) {
      case OracleType.PublicSubscribable:
      case OracleType.PublicFree:
        return data.price || data.value || 0;
      case OracleType.Private:
        // Maybe more complex extraction for private oracles
        return data.price || data.value || 0;
      default:
        return 0;
    }
  }
}
