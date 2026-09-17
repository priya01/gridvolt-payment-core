import { Controller, Post, Body } from '@nestjs/common';
import { OrderClientService } from './order.client.service.js';

@Controller('api/payment')
export class ApiGatewayController {
  constructor(private readonly orderClient: OrderClientService) {}

  @Post('checkout')
  async handleCheckout(@Body() body: { userId: string; productId: string; amount: number }) {
    return this.orderClient.executePaymentTransaction(body);
  }
}
