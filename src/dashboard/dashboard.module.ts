import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { BlockchainService } from 'src/common/blockchain.service';
import { SupabaseService } from 'src/common/supabase.service';

@Module({
  providers: [DashboardService, BlockchainService, SupabaseService],
  controllers: [DashboardController]
})
export class DashboardModule {}
