import React, { useState, useEffect } from 'react';
import { Copy, Check, Clock, RefreshCw, QrCode, ArrowLeft } from 'lucide-react';
import whatsappAPI from '../../services/api';
import type { CreatePaymentResponse, PaymentStatus } from '../../types/api';

interface PixPaymentProps {
  payment: CreatePaymentResponse;
  onPaymentApproved: () => void;
  onBack: () => void;
}

const PixPayment: React.FC<PixPaymentProps> = ({ payment, onPaymentApproved, onBack }) => {
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Verificar status inicial
    checkPaymentStatus();
    
    // Configurar timer para expiração
    const updateTimer = () => {
      const expiresAt = new Date(payment.expiresAt);
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Expirado');
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);

    // Verificar status periodicamente
    const statusInterval = setInterval(checkPaymentStatus, 5000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(statusInterval);
    };
  }, [payment.paymentId]);

  const checkPaymentStatus = async () => {
    try {
      setChecking(true);
      const statusData = await whatsappAPI.getPaymentStatus(payment.paymentId);
      setStatus(statusData);
      
      if (statusData.status === 'approved') {
        onPaymentApproved();
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    } finally {
      setChecking(false);
    }
  };

  const copyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(payment.pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar código PIX:', error);
    }
  };

  const getStatusColor = () => {
    switch (status?.status) {
      case 'approved': return 'text-green-600';
      case 'rejected': case 'cancelled': case 'expired': return 'text-red-600';
      default: return 'text-orange-600';
    }
  };

  const getStatusText = () => {
    switch (status?.status) {
      case 'approved': return 'Pagamento Aprovado!';
      case 'rejected': return 'Pagamento Rejeitado';
      case 'cancelled': return 'Pagamento Cancelado';
      case 'expired': return 'Pagamento Expirado';
      default: return 'Aguardando Pagamento';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span className="hidden sm:inline">Voltar</span>
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Pagamento PIX
        </h2>
      </div>

      {/* Status do Pagamento */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center ${getStatusColor()}`}>
            {status?.status === 'approved' ? (
              <Check className="w-6 h-6 mr-2" />
            ) : (
              <Clock className="w-6 h-6 mr-2" />
            )}
            <span className="font-semibold text-lg">{getStatusText()}</span>
          </div>
          
          <button
            onClick={checkPaymentStatus}
            disabled={checking}
            className="flex items-center text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${checking ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </div>

        {/* Informações do Plano */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">{payment.plan.name}</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>💻 {payment.plan.devices} dispositivo{payment.plan.devices > 1 ? 's' : ''}</div>
            <div>📅 {payment.plan.months} mês{payment.plan.months > 1 ? 'es' : ''}</div>
            <div className="font-semibold text-lg text-gray-900 mt-2">
              💰 R$ {payment.amount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Timer de Expiração */}
        {timeRemaining !== 'Expirado' && status?.status === 'pending' && (
          <div className="text-center mb-4">
            <div className="text-sm text-gray-600">Expira em:</div>
            <div className="text-2xl font-bold text-orange-600">{timeRemaining}</div>
          </div>
        )}
      </div>

      {/* QR Code PIX */}
      {status?.status === 'pending' && timeRemaining !== 'Expirado' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center justify-center">
              <QrCode className="w-5 h-5 mr-2" />
              Escaneie o QR Code
            </h3>
            <p className="text-gray-600 text-sm">
              Use o app do seu banco para escanear o código
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <img
              src={`data:image/png;base64,${payment.pixQrCode}`}
              alt="QR Code PIX"
              className="w-64 h-64 border border-gray-200 rounded-lg"
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Ou copie o código PIX abaixo:
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-xs text-gray-600 break-all font-mono bg-white p-3 rounded border">
                {payment.pixCode}
              </div>
            </div>

            <button
              onClick={copyPixCode}
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 mr-2" />
                  Copiar Código PIX
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Instruções */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">Como pagar:</h4>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Abra o app do seu banco</li>
          <li>2. Selecione a opção PIX</li>
          <li>3. Escaneie o QR Code ou cole o código</li>
          <li>4. Confirme o pagamento</li>
          <li>5. Aguarde a confirmação automática</li>
        </ol>
      </div>

      {/* Status de Erro */}
      {(status?.status === 'expired' || status?.status === 'cancelled' || status?.status === 'rejected') && (
        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Tentar Novamente
          </button>
        </div>
      )}
    </div>
  );
};

export default PixPayment;
