import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller.js';
import { OrderClientService } from './order.client.service.js';

@Module({
  imports: [],
  controllers: [ApiGatewayController],
  providers: [OrderClientService],
})
export class ApiGatewayModule {}
