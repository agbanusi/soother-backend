import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscriptions.service';
import { SubscriptionController } from './subscriptions.controller';
import { BlockchainService } from 'src/common/blockchain.service';
import { SupabaseService } from 'src/common/supabase.service';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService, BlockchainService, SupabaseService],
  exports: [SubscriptionService],
})
export class SubscriptionsModule {}
