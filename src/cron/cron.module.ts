import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { BlockchainService } from 'src/common/blockchain.service';
import { SupabaseService } from 'src/common/supabase.service';

@Module({
  providers: [CronService, BlockchainService, SupabaseService]
})
export class CronModule {}
