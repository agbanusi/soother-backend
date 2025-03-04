import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { FactoryService } from './factory.service';

@Controller('factory')
@UseGuards(AuthGuard('api-key'))
export class FactoryController {
  constructor(private readonly factoryService: FactoryService) {}

  @Post('deploy')
  async deployAggregator(@Body() dto: DeployAggregatorDto) {
    return this.factoryService.deployNewAggregator(dto);
  }
}
