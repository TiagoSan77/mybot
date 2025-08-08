import mongoose, { Document, Schema } from 'mongoose';

export interface IMessageTemplate extends Document {
    templateId: string;
    name: string;
    content: string;
    category?: string;
    tags?: string[];
    userId: string;
    isActive: boolean;
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const messageTemplateSchema = new Schema<IMessageTemplate>({
    templateId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: false,
        trim: true,
        default: 'Geral'
    },
    tags: {
        type: [String],
        default: []
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    usageCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Índice composto para busca eficiente
messageTemplateSchema.index({ userId: 1, category: 1 });
messageTemplateSchema.index({ userId: 1, isActive: 1 });

export const MessageTemplate = mongoose.model<IMessageTemplate>('MessageTemplate', messageTemplateSchema);
