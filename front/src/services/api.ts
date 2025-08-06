import axios from 'axios';
import type { 
  SessionStatus, 
  SessionsResponse, 
  QRResponse, 
  CreateSessionRequest, 
  CreateSessionResponse 
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const whatsappAPI = {
  // Verificar status da API
  async getAPIStatus(): Promise<string> {
    const response = await api.get('/');
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
  }
};

export default whatsappAPI;
