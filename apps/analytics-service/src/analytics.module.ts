import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller.js';

@Module({
  imports: [],
  controllers: [AnalyticsController],
  providers: [],
})
export class AnalyticsModule {}
