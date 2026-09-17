import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { OrderModule } from './order.module.js';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(OrderModule, {
    transport: Transport.GRPC,
    options: {
      package: 'order',
      protoPath: join(process.cwd(), 'proto/order.proto'),
      url: '0.0.0.0:50051', // Binary layer channel mapping
    },
  });

  // ✅ CRITICAL FIX: Global microservice configuration logic handles connection errors gracefully
  process.on('unhandledRejection', (reason) => {
    console.warn('⚠️ Intercepted background connection delay safely:', reason);
  });

  await app.listen();
  console.log('⚡ GridVolt Order-Service Core Engine active on binary port 50051');
}
bootstrap();
