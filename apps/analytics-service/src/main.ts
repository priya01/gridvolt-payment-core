import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AnalyticsModule } from './analytics.module.js';
import mongoose from 'mongoose';

async function bootstrap() {
  const dbUri = process.env.MONGO_URI || 'mongodb://db:27017/gridvoltdb';
  await mongoose.connect(dbUri);
  console.log('💾 Analytics MongoDB Persistence Layer linked securely');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AnalyticsModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
        // ✅ CONNECTION RESILIENCE: Sets explicit timeout to await seed broker discovery
        connectionTimeout: 10000, 
        retry: {
          initialRetryTime: 1000,
          factor: 1.5,
          retries: 30, // 30 times retry logic accommodates slow startup states
        }
      },
      consumer: {
        groupId: 'gridvolt-analytics-group',
        allowAutoTopicCreation: true,
        retry: {
          initialRetryTime: 1000,
          factor: 1.5,
          retries: 30,
        }
      },
    },
  });
  
  await app.listen();
  console.log('📥 GridVolt Analytics Asynchronous Micro-Worker actively polling events stream.');
}
bootstrap();
