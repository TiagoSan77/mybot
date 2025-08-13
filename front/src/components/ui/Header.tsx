import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Plus, RefreshCw, Wifi, WifiOff, QrCode, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import whatsappAPI from '../../services/api';

interface HeaderProps {
  onCreateSession: () => void;
  onSendMessage: () => void;
  onRefresh: () => void;
}

export default function Header({ onCreateSession, onSendMessage, onRefresh }: HeaderProps) {
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');
  const navigate = useNavigate();
  const { user } = useAuth();

  const checkAPIStatus = async () => {
    try {
      await whatsappAPI.getAPIStatus();
      setApiStatus('connected');
    } catch (error) {
      setApiStatus('disconnected');
    }
  };

  useEffect(() => {
    checkAPIStatus();
    const interval = setInterval(checkAPIStatus, 30000); // Verifica a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Bot WhatsApp</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Multi-Sessões</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4 sm:ml-6">
              {apiStatus === 'connected' ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Wifi className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs font-medium hidden sm:inline">API Online</span>
                  <span className="text-xs font-medium sm:hidden">Online</span>
                </div>
              ) : apiStatus === 'disconnected' ? (
                <div className="flex items-center gap-1 text-red-600">
                  <WifiOff className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs font-medium hidden sm:inline">API Offline</span>
                  <span className="text-xs font-medium sm:hidden">Offline</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-gray-600">
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  <span className="text-xs font-medium hidden sm:inline">Verificando...</span>
                  <span className="text-xs font-medium sm:hidden">...</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden md:flex items-center gap-3 mr-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.displayName || user.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    Suas sessões WhatsApp
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-sm">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </span>
                </div>
              </div>
            )}
            
            {/* Botões apenas no desktop */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => navigate('/qr')}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                title="Ver QR Codes"
              >
                <QrCode className="w-4 h-4" />
                <span className="hidden lg:inline">QR Codes</span>
              </button>
              
              <button
                onClick={onRefresh}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                title="Atualizar sessões"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden lg:inline">Atualizar</span>
              </button>
              
              <button
                onClick={onSendMessage}
                className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors border border-blue-200"
                title="Enviar mensagem"
              >
                <Send className="w-4 h-4" />
                <span className="hidden lg:inline">Enviar Mensagem</span>
              </button>
              
              <button
                onClick={onCreateSession}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden lg:inline">Nova Sessão</span>
              </button>
            </div>

            {/* Informações do usuário no mobile */}
            {user && (
              <div className="md:hidden flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-sm">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}