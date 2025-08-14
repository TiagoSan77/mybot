import mongoose, { Document, Schema } from 'mongoose';

export interface IPlan extends Document {
  id: string;
  name: string;
  devices: number;
  price: number;
  description: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const planSchema = new Schema<IPlan>({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  devices: {
    type: Number,
    required: true,
    min: 1,
    max: 3
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IPlan>('Plan', planSchema);
