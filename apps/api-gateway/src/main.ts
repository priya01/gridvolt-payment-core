import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module.js';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  const PORT = process.env.PORT || 3200;
  await app.listen(PORT);
  console.log(`🚀 GridVolt API Gateway perimeter active on port ${PORT}`);
}
bootstrap();
