import { Controller, Get, Param } from '@nestjs/common';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('user/:address')
  async getUserDashboard(@Param('address') address: string) {
    return this.dashboardService.getUserData(address);
  }
}
