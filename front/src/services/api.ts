import axios from 'axios';
import type { 
  SessionStatus, 
  SessionsResponse, 
  QRResponse, 
  CreateSessionRequest, 
  CreateSessionResponse,
  SendMessageRequest,
  SendMessageResponse,
  SessionInfoResponse
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(async (config) => {
  // Tentar obter token do Firebase Auth diretamente
  try {
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
      localStorage.setItem('firebaseToken', token);
    } else {
      // Fallback para token armazenado
      const token = localStorage.getItem('firebaseToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.warn('Erro ao obter token Firebase:', error);
    // Fallback para token armazenado
    const token = localStorage.getItem('firebaseToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return config;
});

export const whatsappAPI = {
  // Configurar token de autenticação
  setAuthToken(token: string | null) {
    if (token) {
      localStorage.setItem('firebaseToken', token);
    } else {
      localStorage.removeItem('firebaseToken');
    }
  },

  // Sincronizar token com Firebase Auth atual
  async syncAuthToken(): Promise<void> {
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken(true); // Force refresh
        this.setAuthToken(token);
      } else {
        this.setAuthToken(null);
      }
    } catch (error) {
      console.error('Erro ao sincronizar token:', error);
    }
  },

  // Verificar status da API
  async getAPIStatus(): Promise<string> {
    const response = await api.get('/');
    return response.data;
  },

  // Verificar status de autenticação
  async getAuthStatus(): Promise<any> {
    const response = await api.get('/auth/status');
    return response.data;
  },

  // Verificar token
  async verifyToken(): Promise<any> {
    const response = await api.post('/auth/verify');
    return response.data;
  },

  // Criar nova sessão
  async createSession(data: CreateSessionRequest): Promise<CreateSessionResponse> {
    const response = await api.post('/sessions', data);
    return response.data;
  },

  // Listar todas as sessões
  async getSessions(): Promise<SessionsResponse> {
    const response = await api.get('/sessions');
    return response.data;
  },

  // Obter status de uma sessão específica
  async getSessionStatus(sessionId: string): Promise<SessionStatus> {
    const response = await api.get(`/sessions/${sessionId}/status`);
    return response.data;
  },

  // Remover sessão
  async deleteSession(sessionId: string): Promise<{ message: string }> {
    const response = await api.delete(`/sessions/${sessionId}`);
    return response.data;
  },

  // Obter QR code com metadados
  async getQRCode(sessionId: string): Promise<QRResponse> {
    const response = await api.get(`/sessions/${sessionId}/qr`);
    return response.data;
  },

  // Obter QR code apenas base64
  async getQRCodeBase64(sessionId: string): Promise<string> {
    const response = await api.get(`/sessions/${sessionId}/qr/base64`);
    return response.data;
  },

  // URL para imagem QR code direta
  getQRImageURL(sessionId: string): string {
    return `${API_BASE_URL}/sessions/${sessionId}/qr/image`;
  },

  // Obter imagem QR como blob com autenticação
  async getQRCodeImage(sessionId: string): Promise<Blob> {
    const response = await api.get(`/sessions/${sessionId}/qr/image`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // === MENSAGENS ===

  // Enviar mensagem através de uma sessão
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await api.post('/messages/send', data);
    return response.data;
  },

  // Obter informações de uma sessão para envio
  async getSessionInfo(sessionId: string): Promise<SessionInfoResponse> {
    const response = await api.get(`/messages/session/${sessionId}`);
    return response.data;
  }
};

export default whatsappAPI;
