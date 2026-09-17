import { Schema, model } from 'mongoose';

export const TransactionSchema = new Schema({
  transactionId: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true }, // Fast retrieval lookup optimization
  productId: { type: String, required: true },
  amount: { type: Number, required: true },
  executionTimestamp: { type: Date, default: Date.now }
});

export const TransactionModel = model('TransactionLog', TransactionSchema);
