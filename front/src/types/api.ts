export interface Session {
  id: string;
  name: string;
  isActive?: boolean;
  hasQRCode?: boolean;
}

export interface SessionStatus {
  session: Session;
  status: 'waiting_qr' | 'connected' | 'disconnected' | 'initializing';
  isActive: boolean;
  hasQRCode: boolean;
}

export interface SessionsResponse {
  total: number;
  sessions: Session[];
}

export interface QRResponse {
  sessionId: string;
  qrCode: string;
  message: string;
}

export interface CreateSessionRequest {
  name: string; // ID será gerado automaticamente no backend
}

export interface CreateSessionResponse {
  message: string;
  session: Session;
  status: string;
}

// === MENSAGENS ===

export interface SendMessageRequest {
  sessionId: string;
  phoneNumber: string;
  message: string;
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  data: {
    sessionId: string;
    phoneNumber: string;
    messageLength: number;
    sentAt: string;
    sentBy: string;
    messageId: string;
  };
}

export interface SessionInfoResponse {
  session: {
    id: string;
    name: string;
    createdAt?: string;
  };
  status: {
    status: 'waiting_qr' | 'connected' | 'disconnected';
    isActive: boolean;
    hasQRCode: boolean;
  };
  canSendMessages: boolean;
  instructions: {
    ready?: string | null;
    qrPending?: string | null;
    disconnected?: string | null;
  };
}

export interface ApiError {
  message: string;
  error?: string;
}
