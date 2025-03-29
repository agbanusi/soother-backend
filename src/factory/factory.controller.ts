import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { FactoryService } from './factory.service';
import { AuthGuard } from '@nestjs/passport';
import { OracleType } from './entities/aggregator.entity';

// Define the DTO in-line or import from a separate file
interface DeployAggregatorDto {
  oracleType: number; // Corresponds to the OracleType enum in the contract
  subscriptionPrice: string;
  sourceAPI: string;
  owner: string;
}

@Controller('factory')
@UseGuards(AuthGuard('api-key'))
export class FactoryController {
  constructor(private readonly factoryService: FactoryService) {}

  @Post('deploy')
  async deployAggregator(@Body() dto: DeployAggregatorDto) {
    return this.factoryService.deployNewAggregator(dto);
  }
}
