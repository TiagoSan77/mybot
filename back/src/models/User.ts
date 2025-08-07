import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>({
    uid: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    displayName: {
        type: String,
        required: false
    },
    photoURL: {
        type: String,
        required: false
    },
    emailVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export const User = mongoose.model<IUser>('User', userSchema);
