import { Injectable } from '@nestjs/common';
import { BlockchainService } from 'src/common/blockchain.service';
import { SupabaseService } from 'src/common/supabase.service';
import { OracleType } from './entities/aggregator.entity';

// DTO for deploying a new aggregator
interface DeployAggregatorDto {
  oracleType: number; // Corresponds to the OracleType enum in the contract
  subscriptionPrice: string;
  sourceAPI: string;
  owner: string;
}

@Injectable()
export class FactoryService {
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async deployNewAggregator(dto: DeployAggregatorDto) {
    const { oracleType, subscriptionPrice, sourceAPI, owner } = dto;

    // Get subscription manager address from env
    const subscriptionManagerAddress = process.env.SUBSCRIPTION_MANAGER_ADDRESS;
    if (!subscriptionManagerAddress) {
      throw new Error('Subscription manager address not configured');
    }

    // Contract deployment logic - match constructor arguments
    const contract = await this.blockchainService.deployContract(
      'EACAggregatorProxy',
      [
        process.env.DEFAULT_AGGREGATOR_ADDRESS, // Default aggregator
        subscriptionManagerAddress,
        oracleType,
      ],
    );

    // No need to await deployment as it's already done in blockchainService.deployContract

    // Get the contract address
    const contractAddress = await contract.getAddress();

    // Set subscription price on the subscription manager
    const subscriptionManager = this.blockchainService.getContract(
      subscriptionManagerAddress,
      ['function setSubscriptionPrice(address, uint256) external'],
    );
    await subscriptionManager.setSubscriptionPrice(
      contractAddress,
      subscriptionPrice,
    );

    // Save to Supabase database
    const aggregator = await this.supabaseService.createAggregator({
      contractAddress: contractAddress,
      owner,
      oracleType: oracleType, // Stored as a number in Supabase
      subscriptionPrice: parseFloat(subscriptionPrice), // Store as number
      sourceAPI,
      lastUpdated: new Date().toISOString(),
    });

    return aggregator;
  }
}
