import { Module } from '@nestjs/common';
import { FactoryController } from './factory.controller';
import { FactoryService } from './factory.service';
import { BlockchainService } from 'src/common/blockchain.service';
import { SupabaseService } from 'src/common/supabase.service';


@Module({
  controllers: [FactoryController],
  providers: [FactoryService, BlockchainService, SupabaseService]
})
export class FactoryModule {}
