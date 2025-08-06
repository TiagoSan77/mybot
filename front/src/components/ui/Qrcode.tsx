import { useState, useEffect } from 'react';
import { QrCode, RefreshCw, ArrowLeft } from 'lucide-react';
import whatsappAPI from '../../services/api';

interface QrcodeProps {
  sessionId?: string;
  onBack?: () => void;
}

export default function Qrcode({ sessionId, onBack }: QrcodeProps) {
  const [qrCode, setQrCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState(sessionId || '');

  const loadSessions = async () => {
    try {
      const response = await whatsappAPI.getSessions();
      setSessions(response.sessions);
      if (!selectedSession && response.sessions.length > 0) {
        setSelectedSession(response.sessions[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
    }
  };

  const loadQRCode = async () => {
    if (!selectedSession) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Sincronizar token antes de tentar obter QR
      await whatsappAPI.syncAuthToken();
      
      const base64 = await whatsappAPI.getQRCodeBase64(selectedSession);
      setQrCode(`data:image/png;base64,${base64}`);
    } catch (error: any) {
      console.error('Erro ao carregar QR Code:', error);
      
      if (error.response?.status === 401) {
        setError('Sessão expirada. Faça login novamente.');
      } else if (error.response?.status === 403) {
        setError('Acesso negado. Esta sessão não pertence a você.');
      } else if (error.response?.status === 404) {
        setError('QR Code não disponível. A sessão pode já estar conectada.');
      } else {
        setError(error.response?.data?.message || 'Erro ao carregar QR Code');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      loadQRCode();
    }
  }, [selectedSession]);

  const selectedSessionData = sessions.find(s => s.id === selectedSession);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <QrCode className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Code WhatsApp</h1>
            <p className="text-gray-600">Escaneie o código para conectar sua sessão</p>
          </div>

          {sessions.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecionar Sessão
              </label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name} ({session.id})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="text-center">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-green-600 mb-2" />
                <p className="text-gray-600">Carregando QR Code...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="text-red-600 text-center mb-4">
                  <p className="font-medium">Erro ao carregar QR Code</p>
                  <p className="text-sm">{error}</p>
                </div>
                <button
                  onClick={loadQRCode}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Tentar Novamente
                </button>
              </div>
            ) : qrCode ? (
              <div className="space-y-6">
                {selectedSessionData && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900">Sessão: {selectedSessionData.name}</h3>
                    <p className="text-sm text-gray-600">ID: {selectedSessionData.id}</p>
                  </div>
                )}
                
                <div className="bg-white p-6 rounded-lg border border-gray-200 inline-block">
                  <img
                    src={qrCode}
                    alt="QR Code WhatsApp"
                    className="w-64 h-64 mx-auto"
                  />
                </div>
                
                <div className="text-sm text-gray-600 max-w-md mx-auto">
                  <p className="mb-2">Para conectar:</p>
                  <ol className="list-decimal list-inside space-y-1 text-left">
                    <li>Abra o WhatsApp no seu celular</li>
                    <li>Toque em Menu ou Configurações</li>
                    <li>Toque em WhatsApp Web</li>
                    <li>Aponte seu celular para esta tela para capturar o código</li>
                  </ol>
                </div>

                <button
                  onClick={loadQRCode}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  Atualizar QR Code
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">Selecione uma sessão para visualizar o QR Code</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}