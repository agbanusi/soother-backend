import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  constructor(
    private readonly blockchainService: BlockchainService,
    @InjectRepository(Aggregator)
    private aggregatorRepo: Repository<Aggregator>,
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

  private async getLatestData(contractAddress: string) {
    const contract = this.blockchainService.getContract(
      contractAddress,
      EACAggregatorProxyABI,
    );
    return contract.latestRoundData();
  }
}
