import { Injectable } from '@nestjs/common';
import { BlockchainService } from 'src/common/blockchain.service';

// Define required constants
const SUBSCRIPTION_MANAGER_ADDRESS =
  process.env.SUBSCRIPTION_MANAGER_ADDRESS ||
  '0x0000000000000000000000000000000000000000';
const ONE_YEAR_SECONDS = 31536000; // 365 days in seconds

// ABI for the SubscriptionManagement contract
const SubscriptionManagementABI = [
  'function subscriptionPrices(address) view returns (uint256)',
  'function purchaseSubscription(address oracle, uint256 duration) payable',
];

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
