import React, { useState, useEffect } from 'react';
import { Calendar, CreditCard, Smartphone, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import whatsappAPI from '../../services/api';
import type { UserSubscription, PaymentHistory } from '../../types/api';

interface SubscriptionManagerProps {
  onUpgrade: () => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ onUpgrade }) => {
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [subscription, history] = await Promise.all([
        whatsappAPI.getUserSubscription(),
        whatsappAPI.getPaymentHistory()
      ]);
      
      setUserSubscription(subscription);
      setPaymentHistory(history);
    } catch (error) {
      console.error('Erro ao carregar dados da assinatura:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSubscriptionData();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'expired': return 'text-red-600 bg-red-50 border-red-200';
      case 'cancelled': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-orange-600 bg-orange-50 border-orange-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'expired': return 'Expirado';
      case 'cancelled': return 'Cancelado';
      case 'inactive': return 'Inativo';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'pending': return 'text-orange-600';
      case 'rejected': case 'cancelled': case 'expired': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Carregando assinatura...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Minha Assinatura</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Status da Assinatura */}
      {userSubscription?.subscription ? (
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Plano Atual</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(userSubscription.subscription.status)}`}>
              {getStatusText(userSubscription.subscription.status)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-sm text-gray-600">Dispositivos</div>
                <div className="font-semibold">
                  {userSubscription.deviceLimits.currentCount} / {userSubscription.deviceLimits.maxDevices}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-sm text-gray-600">Válido até</div>
                <div className="font-semibold">
                  {formatDate(userSubscription.subscription.endDate)}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {userSubscription.subscription.status === 'active' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-600" />
              )}
              <div>
                <div className="text-sm text-gray-600">Status</div>
                <div className="font-semibold">
                  {userSubscription.subscription.status === 'active' ? 'Ativo' : 'Inativo'}
                </div>
              </div>
            </div>
          </div>

          {/* Limite de Dispositivos */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Uso de Dispositivos</span>
              <span className="text-sm text-gray-600">
                {userSubscription.deviceLimits.currentCount} de {userSubscription.deviceLimits.maxDevices}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${(userSubscription.deviceLimits.currentCount / userSubscription.deviceLimits.maxDevices) * 100}%`
                }}
              ></div>
            </div>
            {!userSubscription.deviceLimits.canCreate && (
              <p className="text-xs text-orange-600 mt-2">
                Limite atingido. Faça upgrade para adicionar mais dispositivos.
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onUpgrade}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Renovar / Fazer Upgrade
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 text-center">
          <div className="mb-4">
            <AlertCircle className="w-12 h-12 text-orange-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma Assinatura Ativa
            </h3>
            <p className="text-gray-600">
              Você precisa de uma assinatura ativa para usar o WhatsApp Bot
            </p>
          </div>
          <button
            onClick={onUpgrade}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Escolher Plano
          </button>
        </div>
      )}

      {/* Histórico de Pagamentos */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Pagamentos</h3>
        
        {paymentHistory.length > 0 ? (
          <div className="space-y-4">
            {paymentHistory.slice(0, 5).map((payment) => (
              <div
                key={payment._id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-100 rounded-lg"
              >
                <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {payment.planId.name} - {payment.months} mês{payment.months > 1 ? 'es' : ''}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDate(payment.createdAt)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      R$ {payment.amount.toFixed(2)}
                    </div>
                    <div className={`text-sm font-medium ${getPaymentStatusColor(payment.status)}`}>
                      {payment.status === 'approved' ? 'Pago' : 
                       payment.status === 'pending' ? 'Pendente' : 
                       payment.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum pagamento encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManager;
