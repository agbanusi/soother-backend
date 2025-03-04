import { Injectable } from '@nestjs/common';
import { BlockchainService } from 'src/common/blockchain.service';
import { Aggregator } from 'src/factory/entities/aggregator.entity';

// cron.service.ts
@Injectable()
export class CronService {
  constructor(
    private readonly blockchainService: BlockchainService,
    @InjectRepository(Aggregator)
    private aggregatorRepo: Repository<Aggregator>,
  ) {}

  @Cron('*/5 * * * *') // Every 5 minutes
  async updateAggregators() {
    const aggregators = await this.aggregatorRepo.find();

    for (const agg of aggregators) {
      try {
        const contract = this.blockchainService.getContract(
          agg.contractAddress,
          EACAggregatorProxyABI,
        );

        // Implement your custom update logic
        const tx = await contract.updatePrice();
        await tx.wait();

        // Log successful update
        // this.logUpdate(agg, true);
      } catch (error) {
        // this.logUpdate(agg, false, error.message);
      }
    }
  }
}
