import { Injectable, HttpException, HttpStatus, OnModuleInit } from '@nestjs/common';
import { Client, Transport } from '@nestjs/microservices';
import type { ClientGrpc } from '@nestjs/microservices'
import { join } from 'path';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OrderClientService implements OnModuleInit {
  // Mapping the secure gRPC transport interface layer natively
  @Client({
    transport: Transport.GRPC,
    options: {
      package: 'order',
      protoPath: join(process.cwd(), 'proto/order.proto'),
      url: 'order-service:50051', // Docker internal cluster port
    },
  })
  private client: ClientGrpc;
  private orderService: any;

  // Circuit Breaker System Variables
  private isCircuitOpen = false;
  private failureCount = 0;
  private lastStateChange = Date.now();
  
  private readonly FAILURE_THRESHOLD = 5; // 5 errors aate hi switch gir jayega (MCB trip)
  private readonly COOLDOWN_WINDOW = 30000; // 30 seconds wait timer database saans le sake

  onModuleInit() {
    this.orderService = this.client.getService<any>('OrderService');
  }

  async executePaymentTransaction(body: { userId: string; productId: string; amount: number }) {
    this.evaluateCircuitState();

    // 🛡️ THE FAIL-FAST SHIELD: Agar circuit open hai, toh database tak network call mat karo!
    if (this.isCircuitOpen) {
      throw new HttpException(
        'GridVolt Notification: Circuit Breaker Active. System Degradation detected. Failing Fast.', 
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    try {
      // High-speed binary network pipeline trigger
      const response = await lastValueFrom(this.orderService.ProcessTransaction(body));
      this.resetFailureCounters();
      return response;
    } catch (error: any) { // Enforcing explicit any schema
      this.recordFailure();
      throw new HttpException(
        `GridVolt Core Exception: Transaction aborted due to ${error?.message || error}`, 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private evaluateCircuitState() {
    // Self-healing: 30 seconds baad check karne ke liye test connection mode activate karo (HALF-OPEN)
    if (this.isCircuitOpen && Date.now() - this.lastStateChange > this.COOLDOWN_WINDOW) {
      console.log('🔄 Circuit shifting from OPEN to HALF-OPEN. Probing downstream node stability...');
      this.isCircuitOpen = false;
    }
  }

  private recordFailure() {
    this.failureCount++;
    if (this.failureCount >= this.FAILURE_THRESHOLD) {
      this.isCircuitOpen = true;
      this.lastStateChange = Date.now();
      console.error(`💥 MCB TRIPPED! Circuit Breaker is now OPEN. Threshold breached at ${this.failureCount} errors.`);
    }
  }

  private resetFailureCounters() {
    this.failureCount = 0;
    this.isCircuitOpen = false;
  }
}
