import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  userId: string;
  planId: string;
  devices: number;
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>({
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
  devices: {
    type: Number,
    required: true,
    min: 1,
    max: 3
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired', 'cancelled'],
    default: 'inactive'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  autoRenew: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Índice composto para buscar a assinatura ativa de um usuário
subscriptionSchema.index({ userId: 1, status: 1 });

export default mongoose.model<ISubscription>('Subscription', subscriptionSchema);
