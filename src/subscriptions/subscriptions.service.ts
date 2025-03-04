import { Injectable } from '@nestjs/common';
import { BlockchainService } from 'src/common/blockchain.service';

@Injectable()
export class SubscriptionService {
  constructor(private readonly blockchainService: BlockchainService) {}

  async generateTxData(oracleAddress: string, duration: number) {
    const contract = this.blockchainService.getContract(
      SUBSCRIPTION_MANAGER_ADDRESS,
      SubscriptionManagementABI,
    );

    const price = await contract.subscriptionPrices(oracleAddress);
    const value = price.mul(duration).div(ONE_YEAR_SECONDS);

    return {
      to: SUBSCRIPTION_MANAGER_ADDRESS,
      data: contract.interface.encodeFunctionData('purchaseSubscription', [
        oracleAddress,
        duration,
      ]),
      value: value.toString(),
    };
  }
}
