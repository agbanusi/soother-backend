import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FactoryModule } from './factory/factory.module';
import { CronModule } from './cron/cron.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    CommonModule,
    SubscriptionsModule,
    DashboardModule,
    FactoryModule,
    CronModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
