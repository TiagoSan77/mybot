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

export interface ApiError {
  message: string;
  error?: string;
}
