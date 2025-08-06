import React, { useState, useEffect } from 'react';
import whatsappAPI from '../../services/api';
import type { Session, SessionInfoResponse, SendMessageResponse } from '../../types/api';

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSessions: Session[];
  onMessageSent?: (result: SendMessageResponse) => void;
}

const SendMessageModal: React.FC<SendMessageModalProps> = ({
  isOpen,
  onClose,
  userSessions,
  onMessageSent
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<SessionInfoResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Limpar formulário quando modal fechar
  useEffect(() => {
    if (!isOpen) {
      setSelectedSessionId('');
      setPhoneNumber('');
      setMessage('');
      setSessionInfo(null);
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  // Carregar informações da sessão quando selecionada
  useEffect(() => {
    if (selectedSessionId) {
      loadSessionInfo(selectedSessionId);
    } else {
      setSessionInfo(null);
    }
  }, [selectedSessionId]);

  const loadSessionInfo = async (sessionId: string) => {
    try {
      setError('');
      const info = await whatsappAPI.getSessionInfo(sessionId);
      setSessionInfo(info);
    } catch (error: any) {
      console.error('Erro ao carregar informações da sessão:', error);
      setError('Erro ao carregar informações da sessão');
      setSessionInfo(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSessionId || !phoneNumber || !message) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    if (!sessionInfo?.canSendMessages) {
      setError('A sessão selecionada não está pronta para envio de mensagens');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await whatsappAPI.sendMessage({
        sessionId: selectedSessionId,
        phoneNumber,
        message
      });

      setSuccess('Mensagem enviada com sucesso!');
      setPhoneNumber('');
      setMessage('');
      
      if (onMessageSent) {
        onMessageSent(result);
      }

      // Fechar modal após 2 segundos
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      setError(error.response?.data?.message || 'Erro ao enviar mensagem');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, '');
    
    // Aplica formatação brasileira
    if (digits.length <= 11) {
      return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (digits.length <= 13) {
      return digits.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 ($2) $3-$4');
    }
    
    return digits;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  // Filtrar apenas sessões ativas
  const activeSessions = userSessions.filter(session => session.isActive);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Enviar Mensagem</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seleção de Sessão */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sessão WhatsApp
            </label>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={isLoading}
            >
              <option value="">Selecione uma sessão...</option>
              {activeSessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name} ({session.id})
                  {session.hasQRCode && ' - Aguardando QR'}
                </option>
              ))}
            </select>
            {activeSessions.length === 0 && (
              <p className="text-sm text-red-600 mt-1">
                Nenhuma sessão ativa encontrada. Crie e ative uma sessão primeiro.
              </p>
            )}
          </div>

          {/* Status da Sessão */}
          {sessionInfo && (
            <div className={`p-3 rounded-md ${sessionInfo.canSendMessages ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  sessionInfo.status.status === 'connected' ? 'bg-green-500' :
                  sessionInfo.status.status === 'waiting_qr' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium">
                  {sessionInfo.status.status === 'connected' && 'Conectado - Pronto para envio'}
                  {sessionInfo.status.status === 'waiting_qr' && 'Aguardando QR Code'}
                  {sessionInfo.status.status === 'disconnected' && 'Desconectado'}
                </span>
              </div>
              {Object.values(sessionInfo.instructions).find(msg => msg) && (
                <p className="text-xs text-gray-600 mt-1">
                  {Object.values(sessionInfo.instructions).find(msg => msg)}
                </p>
              )}
            </div>
          )}

          {/* Número de Telefone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Telefone
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="(11) 99999-9999 ou +55 (11) 99999-9999"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Formato aceito: com ou sem código do país (+55)
            </p>
          </div>

          {/* Mensagem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem aqui..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length} caracteres
            </p>
          </div>

          {/* Mensagens de erro/sucesso */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* Botões */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2 text-white rounded-md transition-colors ${
                isLoading || !sessionInfo?.canSendMessages
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
              disabled={isLoading || !sessionInfo?.canSendMessages}
            >
              {isLoading ? 'Enviando...' : 'Enviar Mensagem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendMessageModal;
