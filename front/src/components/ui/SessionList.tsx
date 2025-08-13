import { useState, useEffect } from 'react';
import { 
  Phone, 
  QrCode, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Loader2 
} from 'lucide-react';
import whatsappAPI from '../../services/api';
import type { Session, SessionStatus } from '../../types/api';

interface SessionCardProps {
  session: Session;
  onShowQR: (sessionId: string, sessionName: string) => void;
  onDelete: (sessionId: string) => void;
  onRefresh: () => void;
}

function SessionCard({ session, onShowQR, onDelete, onRefresh }: SessionCardProps) {
  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const statusData = await whatsappAPI.getSessionStatus(session.id);
      setStatus(statusData);
    } catch (error) {
      console.error('Erro ao carregar status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja remover a sessão "${session.name}"?`)) {
      try {
        await whatsappAPI.deleteSession(session.id);
        onDelete(session.id);
        onRefresh();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Erro ao remover sessão');
      }
    }
  };

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="w-4 h-4 animate-spin text-gray-500" />;
    
    switch (status?.status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'waiting_qr':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (status?.status) {
      case 'connected':
        return 'Conectado';
      case 'waiting_qr':
        return 'Aguardando QR';
      case 'disconnected':
        return 'Desconectado';
      case 'initializing':
        return 'Inicializando';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusColor = () => {
    switch (status?.status) {
      case 'connected':
        return 'text-green-600 bg-green-50';
      case 'waiting_qr':
        return 'text-yellow-600 bg-yellow-50';
      case 'disconnected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  useEffect(() => {
    loadStatus();
  }, [session.id]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
      <div className="flex flex-col sm:flex-row items-start justify-between mb-4 space-y-2 sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{session.name}</h3>
          <p className="text-xs sm:text-sm text-gray-600 truncate">ID: {session.id}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={loadStatus}
            className="p-1 hover:bg-gray-100 rounded"
            title="Atualizar status"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-red-100 rounded"
            title="Remover sessão"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {getStatusIcon()}
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => onShowQR(session.id, session.name)}
          disabled={status?.status === 'connected'}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <QrCode className="w-4 h-4" />
          <span className="hidden sm:inline">Ver QR Code</span>
          <span className="sm:hidden">QR Code</span>
        </button>
        <button
          onClick={loadStatus}
          className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
        >
          <Phone className="w-4 h-4" />
          Status
        </button>
      </div>
    </div>
  );
}

interface SessionListProps {
  onShowQR: (sessionId: string, sessionName: string) => void;
  refreshTrigger: number;
}

export default function SessionList({ onShowQR, refreshTrigger }: SessionListProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSessions = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await whatsappAPI.getSessions();
      setSessions(response.sessions);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao carregar sessões');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
  };

  useEffect(() => {
    loadSessions();
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-2" />
          <p className="text-gray-600">Carregando sessões...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <div className="text-red-600 mb-4">
          <p className="font-medium text-sm sm:text-base">Erro ao carregar sessões</p>
          <p className="text-xs sm:text-sm">{error}</p>
        </div>
        <button
          onClick={loadSessions}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <Phone className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Nenhuma sessão encontrada</h3>
        <p className="text-sm sm:text-base text-gray-600">Crie sua primeira sessão WhatsApp para começar</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          onShowQR={onShowQR}
          onDelete={handleDeleteSession}
          onRefresh={loadSessions}
        />
      ))}
    </div>
  );
}
