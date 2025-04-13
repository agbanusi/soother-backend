import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { SupabaseService } from './supabase.service';
import { ApiKeyStrategy } from './api-key.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports:[PassportModule],
  providers: [BlockchainService, SupabaseService, ApiKeyStrategy],
  exports: [BlockchainService, SupabaseService],
})
export class CommonModule {}
