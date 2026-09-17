import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { TransactionModel } from './schemas/transaction.schema.js';

@Controller()
export class AnalyticsController {

  // 📥 THE CONSUMER INTERFACE: Kafka event loop triggers automatically here
  @EventPattern('transaction.analytics.stream')
  async handleTransactionEvent(@Payload() message: any) {
    try {
      // Kafka payload buffers come as serialized texts strings parameters
      const parsedData = typeof message === 'string' ? JSON.parse(message) : message;

      console.log(`📥 Kafka Packet Intercepted: Processing transaction data logs for account token: ${parsedData.userId}`);

      // Asynchronously persisting telemetry markers securely into MongoDB Sharded Collections
      await TransactionModel.create({
        transactionId: parsedData.transactionId,
        userId: parsedData.userId,
        productId: parsedData.productId,
        amount: parsedData.amount,
        executionTimestamp: parsedData.executionTimestamp
      });

      console.log(`💾 Ledger Telemetry Serialization Complete for reference index ID: ${parsedData.transactionId}`);
    }  catch (crashError: any) { // Enforcing explicit any schema
      console.error('💥 Background database serialization failure crash logger:', crashError?.message || crashError);
    }
  }
}
