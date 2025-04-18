import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { BlockchainService } from '../common/blockchain.service';
import { SupabaseService } from '../common/supabase.service';

@Module({
  providers: [DashboardService, BlockchainService, SupabaseService],
  controllers: [DashboardController],
})
export class DashboardModule {}
