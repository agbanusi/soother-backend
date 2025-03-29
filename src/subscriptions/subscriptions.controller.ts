import { Controller, Get, Param, Query } from '@nestjs/common';
import { SubscriptionService } from './subscriptions.service';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('tx-data/:oracleAddress')
  async getSubscriptionTxData(
    @Param('oracleAddress') oracleAddress: string,
    @Query('duration') duration: number,
  ) {
    return this.subscriptionService.generateTxData(oracleAddress, duration);
  }
}
