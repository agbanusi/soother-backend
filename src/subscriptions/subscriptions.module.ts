import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscriptions.service';
import { SubscriptionController } from './subscriptions.controller';
import { BlockchainService } from '../common/blockchain.service';
import { SupabaseService } from '../common/supabase.service';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService, BlockchainService, SupabaseService],
  exports: [SubscriptionService],
})
export class SubscriptionsModule {}
