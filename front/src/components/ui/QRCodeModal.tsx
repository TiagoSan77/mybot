import { useState, useEffect } from 'react';
import { QrCode, RefreshCw, Download, X } from 'lucide-react';
import whatsappAPI from '../../services/api';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  sessionName: string;
}

export default function QRCodeModal({ isOpen, onClose, sessionId, sessionName }: QRCodeModalProps) {
  const [qrCode, setQrCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadQRCode = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const base64 = await whatsappAPI.getQRCodeBase64(sessionId);
      setQrCode(`data:image/png;base64,${base64}`);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao carregar QR Code');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode) return;
    
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `qr-${sessionId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (isOpen && sessionId) {
      loadQRCode();
    }
  }, [isOpen, sessionId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold truncate">QR Code WhatsApp</h2>
              <p className="text-xs sm:text-sm text-gray-600 truncate">{sessionName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 sm:h-64">
              <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-green-600 mb-2" />
              <p className="text-sm sm:text-base text-gray-600">Carregando QR Code...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-48 sm:h-64">
              <div className="text-red-600 text-center mb-4">
                <p className="font-medium text-sm sm:text-base">Erro ao carregar QR Code</p>
                <p className="text-xs sm:text-sm">{error}</p>
              </div>
              <button
                onClick={loadQRCode}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm sm:text-base"
              >
                <RefreshCw className="w-4 h-4" />
                Tentar Novamente
              </button>
            </div>
          ) : qrCode ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <img
                  src={qrCode}
                  alt="QR Code WhatsApp"
                  className="w-full max-w-xs mx-auto"
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-600">
                Escaneie este QR Code com seu WhatsApp para conectar
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={loadQRCode}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  <RefreshCw className="w-4 h-4" />
                  Atualizar
                </button>
                <button
                  onClick={downloadQRCode}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm sm:text-base"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
