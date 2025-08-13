import mongoose, { Document, Schema } from 'mongoose';

export interface IScheduledMessage extends Document {
    messageId: string;
    userId: string;
    sessionId: string;
    recipientNumber: string;
    recipientName?: string;
    templateId?: string;
    messageContent: string;
    scheduledDate: Date;
    status: 'pending' | 'sent' | 'failed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
    sentAt?: Date;
    errorMessage?: string;
    attempts: number;
    maxAttempts: number;
}

const scheduledMessageSchema = new Schema<IScheduledMessage>({
    messageId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    recipientNumber: {
        type: String,
        required: true,
        trim: true
    },
    recipientName: {
        type: String,
        required: false,
        trim: true
    },
    templateId: {
        type: String,
        required: false,
        index: true
    },
    messageContent: {
        type: String,
        required: true
    },
    scheduledDate: {
        type: Date,
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'cancelled'],
        default: 'pending',
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    sentAt: {
        type: Date,
        required: false
    },
    errorMessage: {
        type: String,
        required: false
    },
    attempts: {
        type: Number,
        default: 0
    },
    maxAttempts: {
        type: Number,
        default: 3
    }
}, {
    timestamps: true
});

// Índice composto para otimizar consultas de agendamento
scheduledMessageSchema.index({ status: 1, scheduledDate: 1 });
scheduledMessageSchema.index({ userId: 1, status: 1 });

export const ScheduledMessage = mongoose.model<IScheduledMessage>('ScheduledMessage', scheduledMessageSchema);
