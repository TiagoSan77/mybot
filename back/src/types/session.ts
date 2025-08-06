import { Client } from 'whatsapp-web.js';

export interface Session {
    id: string;
    name: string;
    userId?: string | undefined;     // ID do usuário Firebase que criou a sessão
    userEmail?: string | undefined;  // Email do usuário Firebase
    createdAt?: Date | undefined;    // Data de criação
}

export interface SessionWithStatus extends Session {
    isActive: boolean;
    hasQRCode: boolean;
}

export interface SessionStatus {
    session: Session;
    status: 'waiting_qr' | 'connected' | 'disconnected';
    isActive: boolean;
    hasQRCode: boolean;
}

export interface ActiveClients {
    [sessionId: string]: Client;
}

export interface QRCodes {
    [sessionId: string]: string;
}
