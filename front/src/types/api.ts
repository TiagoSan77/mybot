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

// === PAGAMENTOS ===

export interface Plan {
  id: string;
  name: string;
  devices: number;
  price: number;
  description: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  planId: string;
  months: number;
}

export interface CreatePaymentResponse {
  paymentId: string;
  mercadoPagoId: string;
  pixCode: string;
  pixQrCode: string;
  amount: number;
  expiresAt: string;
  plan: {
    name: string;
    devices: number;
    months: number;
  };
}

export interface PaymentStatus {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';
  amount: number;
  pixCode: string;
  pixQrCode: string;
  expiresAt: string;
  approvedAt?: string;
  plan: Plan;
  months: number;
}

export interface Subscription {
  id: string;
  planId: string;
  devices: number;
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

export interface UserSubscription {
  subscription: Subscription | null;
  deviceLimits: {
    canCreate: boolean;
    currentCount: number;
    maxDevices: number;
  };
}

export interface PaymentHistory {
  _id: string;
  planId: Plan;
  months: number;
  amount: number;
  status: string;
  createdAt: string;
  approvedAt?: string;
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

// === TEMPLATES DE MENSAGEM ===

export interface MessageTemplate {
  templateId: string;
  name: string;
  content: string;
  category?: string;
  tags?: string[];
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateRequest {
  name: string;
  content: string;
  category?: string;
  tags?: string[];
}

export interface CreateTemplateResponse {
  success: boolean;
  message: string;
  data: MessageTemplate;
}

export interface TemplatesResponse {
  success: boolean;
  message: string;
  data: {
    templates: MessageTemplate[];
    categorized: Record<string, MessageTemplate[]>;
    total: number;
  };
}

export interface TemplateResponse {
  success: boolean;
  message: string;
  data: MessageTemplate;
}

export interface UpdateTemplateRequest {
  name?: string;
  content?: string;
  category?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: {
    categories: string[];
  };
}
