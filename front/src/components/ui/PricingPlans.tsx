import React, { useState, useEffect } from 'react';
import { Check, CreditCard, Smartphone, Users, Crown } from 'lucide-react';
import whatsappAPI from '../../services/api';
import type { Plan, CreatePaymentResponse } from '../../types/api';

interface PricingPlanProps {
  onPaymentCreated: (payment: CreatePaymentResponse) => void;
}

const PricingPlans: React.FC<PricingPlanProps> = ({ onPaymentCreated }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const monthsOptions = [
    { value: 1, label: '1 mês' },
    { value: 3, label: '3 meses', discount: 5 },
    { value: 6, label: '6 meses', discount: 10 },
    { value: 12, label: '12 meses', discount: 15 }
  ];

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const plansData = await whatsappAPI.getPlans();
      setPlans(plansData);
      if (plansData.length > 0) {
        setSelectedPlan(plansData[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      setError('Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = (plan: Plan, months: number) => {
    const basePrice = plan.price * months;
    const monthOption = monthsOptions.find(m => m.value === months);
    const discount = monthOption?.discount || 0;
    
    return {
      base: basePrice,
      discount: (basePrice * discount) / 100,
      final: basePrice - (basePrice * discount) / 100
    };
  };

  const handleCreatePayment = async () => {
    if (!selectedPlan) {
      setError('Selecione um plano');
      return;
    }

    try {
      setCreating(true);
      setError('');

      const payment = await whatsappAPI.createPayment({
        planId: selectedPlan,
        months: selectedMonths
      });

      onPaymentCreated(payment);
    } catch (error: any) {
      console.error('Erro ao criar pagamento:', error);
      setError(error.response?.data?.error || 'Erro ao processar pagamento');
    } finally {
      setCreating(false);
    }
  };

  const getPlanIcon = (devices: number) => {
    switch (devices) {
      case 1: return <Smartphone className="w-8 h-8 text-blue-600" />;
      case 2: return <Users className="w-8 h-8 text-green-600" />;
      case 3: return <Crown className="w-8 h-8 text-purple-600" />;
      default: return <CreditCard className="w-8 h-8 text-gray-600" />;
    }
  };

  const getPlanColor = (devices: number) => {
    switch (devices) {
      case 1: return 'border-blue-200 bg-blue-50';
      case 2: return 'border-green-200 bg-green-50';
      case 3: return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Carregando planos...</span>
      </div>
    );
  }

  if (error && plans.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">❌ {error}</div>
        <button
          onClick={loadPlans}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          Escolha seu Plano
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Selecione o plano ideal para suas necessidades de WhatsApp Business
        </p>
      </div>

      {/* Seletor de Meses */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Duração da Assinatura
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {monthsOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedMonths(option.value)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedMonths === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">{option.label}</div>
              {option.discount && (
                <div className="text-xs text-green-600 font-semibold">
                  -{option.discount}% desconto
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Planos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => {
          const pricing = calculatePrice(plan, selectedMonths);
          const isSelected = selectedPlan === plan.id;
          const isPopular = plan.devices === 2;

          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all ${
                isSelected
                  ? `${getPlanColor(plan.devices)} border-blue-500 shadow-lg`
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {getPlanIcon(plan.devices)}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  {plan.description}
                </p>

                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900">
                    R$ {pricing.final.toFixed(2)}
                  </div>
                  {pricing.discount > 0 && (
                    <div className="text-sm text-gray-500">
                      <span className="line-through">R$ {pricing.base.toFixed(2)}</span>
                      <span className="text-green-600 font-semibold ml-2">
                        Economize R$ {pricing.discount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="text-sm text-gray-500">
                    por {selectedMonths} mês{selectedMonths > 1 ? 'es' : ''}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-center text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    <span>{plan.devices} dispositivo{plan.devices > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center justify-center text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    <span>Mensagens ilimitadas</span>
                  </div>
                  <div className="flex items-center justify-center text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    <span>Agendamento de mensagens</span>
                  </div>
                  <div className="flex items-center justify-center text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    <span>Templates personalizados</span>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-4 p-2 bg-blue-100 rounded-lg">
                    <Check className="w-5 h-5 text-blue-600 mx-auto" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Botão de Pagamento */}
      {selectedPlan && (
        <div className="text-center">
          <button
            onClick={handleCreatePayment}
            disabled={creating}
            className="w-full sm:w-auto px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {creating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block mr-2"></div>
                Processando...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 inline-block mr-2" />
                Pagar com PIX
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default PricingPlans;
