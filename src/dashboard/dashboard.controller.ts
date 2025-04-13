import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { ApiKeyGuard } from 'src/common/api-key.guard';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(ApiKeyGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('user/:address')
  @ApiOperation({ summary: 'Get user dashboard data' })
  @ApiParam({ name: 'address', description: 'Ethereum address of the user' })
  @ApiResponse({
    status: 200,
    description: 'User dashboard data including owned and subscribed oracles',
  })
  async getUserData(@Param('address') address: string) {
    return this.dashboardService.getUserData(address);
  }

  @Get('oracle/:address')
  @ApiOperation({ summary: 'Get oracle statistics' })
  @ApiParam({ name: 'address', description: 'Oracle contract address' })
  @ApiResponse({
    status: 200,
    description: 'Oracle statistics including current price and metadata',
  })
  async getOracleStats(@Param('address') address: string) {
    return this.dashboardService.getOracleStats(address);
  }

  @Get('oracle/:address/history')
  @ApiOperation({ summary: 'Get oracle price history' })
  @ApiParam({ name: 'address', description: 'Oracle contract address' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of historical entries to return',
  })
  @ApiResponse({ status: 200, description: 'Oracle price history' })
  async getOracleHistory(
    @Param('address') address: string,
    @Query('limit') limit?: number,
  ) {
    return this.dashboardService.getOracleHistory(address, limit);
  }
}
