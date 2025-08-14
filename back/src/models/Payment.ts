import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  userId: string;
  planId: string;
  months: number;
  amount: number;
  mercadoPagoId: string;
  pixCode: string;
  pixQrCode: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';
  paymentMethod: 'pix';
  subscriptionId?: string;
  expiresAt: Date;
  approvedAt?: Date;
  mercadoPagoData?: any;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  planId: {
    type: String,
    required: true,
    ref: 'Plan'
  },
  months: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  mercadoPagoId: {
    type: String,
    required: true,
    unique: true
  },
  pixCode: {
    type: String,
    required: true
  },
  pixQrCode: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'expired'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['pix'],
    default: 'pix'
  },
  subscriptionId: {
    type: String,
    ref: 'Subscription'
  },
  expiresAt: {
    type: Date,
    required: true
  },
  approvedAt: {
    type: Date
  },
  mercadoPagoData: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Índices para otimizar consultas
paymentSchema.index({ mercadoPagoId: 1 });
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ expiresAt: 1 });

export default mongoose.model<IPayment>('Payment', paymentSchema);
