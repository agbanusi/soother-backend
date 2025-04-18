import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SubscriptionService } from './subscriptions.service';
import { PurchaseSubscriptionDto } from './dto/purchase-subscription.dto';
import { ApiKeyGuard } from '../common/api-key.guard';

@ApiTags('subscriptions')
@Controller('subscriptions')
@UseGuards(ApiKeyGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('purchase')
  @ApiOperation({
    summary: 'Generate transaction data for purchasing a subscription',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction data for subscription purchase',
  })
  async purchaseSubscription(@Body() dto: PurchaseSubscriptionDto) {
    return this.subscriptionService.generateTxData(
      dto.oracleAddress,
      dto.duration,
    );
  }

  @Get('active/:address')
  @ApiOperation({ summary: 'Get active subscriptions for an address' })
  @ApiParam({ name: 'address', description: 'Subscriber address' })
  @ApiResponse({ status: 200, description: 'List of active subscriptions' })
  async getActiveSubscriptions(@Param('address') address: string) {
    return this.subscriptionService.getActiveSubscriptions(address);
  }

  @Get('price/:oracleAddress')
  @ApiOperation({ summary: 'Get subscription price for an oracle' })
  @ApiParam({ name: 'oracleAddress', description: 'Oracle contract address' })
  @ApiResponse({ status: 200, description: 'Subscription price in wei' })
  async getSubscriptionPrice(@Param('oracleAddress') oracleAddress: string) {
    return this.subscriptionService.getSubscriptionPrice(oracleAddress);
  }

  @Get('expiry/:oracleAddress/:subscriber')
  @ApiOperation({ summary: 'Get subscription expiry time' })
  @ApiParam({ name: 'oracleAddress', description: 'Oracle contract address' })
  @ApiParam({ name: 'subscriber', description: 'Subscriber address' })
  @ApiResponse({ status: 200, description: 'Subscription expiry timestamp' })
  async getSubscriptionExpiry(
    @Param('oracleAddress') oracleAddress: string,
    @Param('subscriber') subscriber: string,
  ) {
    return this.subscriptionService.getSubscriptionExpiry(
      oracleAddress,
      subscriber,
    );
  }
}
