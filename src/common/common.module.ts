import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { SupabaseService } from './supabase.service';

@Module({
  providers: [BlockchainService, SupabaseService],
  exports: [BlockchainService, SupabaseService],
})
export class CommonModule {}
