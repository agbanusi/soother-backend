import { Injectable } from '@nestjs/common';
import { BlockchainService } from 'src/common/blockchain.service';
import { Aggregator } from './entities/aggregator.entity';

@Injectable()
export class FactoryService {
  constructor(
    private readonly blockchainService: BlockchainService,
    @InjectRepository(Aggregator)
    private aggregatorRepo: Repository<Aggregator>,
  ) {}

  async deployNewAggregator(dto: DeployAggregatorDto) {
    const { oracleType, subscriptionPrice, sourceAPI, owner } = dto;

    // Contract deployment logic
    const contract = await this.blockchainService.deployContract(
      'EACAggregatorProxy',
      [subscriptionPrice, oracleType, sourceAPI],
    );

    // Save to database
    const aggregator = this.aggregatorRepo.create({
      contractAddress: contract.address,
      owner,
      oracleType,
      subscriptionPrice,
      sourceAPI,
    });

    return this.aggregatorRepo.save(aggregator);
  }
}
