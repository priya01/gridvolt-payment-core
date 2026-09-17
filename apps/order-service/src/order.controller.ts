import { Controller } from '@nestjs/common';
import { GrpcMethod, Client, ClientKafka, Transport } from '@nestjs/microservices';

@Controller()
export class OrderController {
  // ⚡ LINKING KAFKA: Back-end communication channel drivers register kiya
   @Client({
    transport: Transport.KAFKA,
    options: {
      client: { 
        brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
        connectionTimeout: 10000,
        retry: {
          initialRetryTime: 1000,
          factor: 1.5,
          retries: 30
        }
      },
      consumer: { 
        groupId: 'gridvolt-producer-client',
        allowAutoTopicCreation: true
      },
      producer: {
        allowAutoTopicCreation: true,
        retry: {
          initialRetryTime: 1000,
          factor: 1.5,
          retries: 30
        }
      }
    }
  })

  private kafkaClient: ClientKafka;

  async onModuleInit() {
    // Kafka payload tracking configurations registers loop
    this.kafkaClient.subscribeToResponseOf('transaction.analytics.stream');
    await this.kafkaClient.connect();
  }

  // 🤖 THE gRPC HANDLER: Google binary validation contract trigger line
  @GrpcMethod('OrderService', 'ProcessTransaction')
  async processTransaction(data: { userId: string; productId: string; amount: number }) {
    // Creating unique high-entropy transaction identifiers hashes
    const generatedTxId = `TX_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    const operationalPayload = {
      transactionId: generatedTxId,
      userId: data.userId,
      productId: data.productId,
      amount: data.amount,
      executionTimestamp: new Date().toISOString()
    };

    // 🚀 ASYNC FIRE AND FORGET: System events pushed directly to Kafka Broker topic stream
    this.kafkaClient.emit('transaction.analytics.stream', {
      key: data.userId, // Partition affinity matrix: Same user hits always land on same partition
      value: JSON.stringify(operationalPayload)
    });

    // Instantly returning binary feedback acknowledgment response back to API-Gateway
    return {
      transactionId: generatedTxId,
      status: 'COMMITTED_IN_QUEUE',
      message: 'Transaction authorized safely. Asynchronous telemetry ingestion pipeline active.'
    };
  }
}
