import { Schema, model, Document, Types } from 'mongoose';

// Mongoose Schema
const refreshTokenSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
        revokedAt: { type: Date, default: null },
        expiresAt: { type: Date, required: true },
    },
    {
        timestamps: true, // This will automatically handle createdAt and updatedAt
    },
);

// Mongoose Model Interface
export interface IRefreshToken extends Document {
    userId: Types.ObjectId;
    revokedAt: string | null;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
}

// Create the model
export const RefreshTokenModel = model<IRefreshToken>('RefreshToken', refreshTokenSchema);

export interface AtPayload {
    sub: number;
    iat: number;
    exp: number;
}

export interface RtPayload extends AtPayload {
    jti: number;
}

export interface RefreshToken
    extends Omit<IRefreshToken, 'createdAt' | 'updatedAt' | 'revokedAt' | 'expiresAt'> {
    revokedAt: Date | null;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
