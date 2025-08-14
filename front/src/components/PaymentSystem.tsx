import React, { useState } from 'react';
import PricingPlans from './ui/PricingPlans';
import PixPayment from './ui/PixPayment';
import SubscriptionManager from './ui/SubscriptionManager';
import type { CreatePaymentResponse } from '../types/api';

type PaymentStep = 'subscription' | 'plans' | 'payment' | 'success';

const PaymentSystem: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<PaymentStep>('subscription');
  const [currentPayment, setCurrentPayment] = useState<CreatePaymentResponse | null>(null);

  const handleUpgrade = () => {
    setCurrentStep('plans');
  };

  const handlePaymentCreated = (payment: CreatePaymentResponse) => {
    setCurrentPayment(payment);
    setCurrentStep('payment');
  };

  const handlePaymentApproved = () => {
    setCurrentStep('success');
    // Reiniciar após alguns segundos
    setTimeout(() => {
      setCurrentStep('subscription');
      setCurrentPayment(null);
    }, 3000);
  };

  const handleBackToPlans = () => {
    setCurrentStep('plans');
    setCurrentPayment(null);
  };

  const handleBackToSubscription = () => {
    setCurrentStep('subscription');
    setCurrentPayment(null);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'subscription':
        return <SubscriptionManager onUpgrade={handleUpgrade} />;
      
      case 'plans':
        return (
          <div>
            <div className="mb-4">
              <button
                onClick={handleBackToSubscription}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                ← Voltar para Assinatura
              </button>
            </div>
            <PricingPlans onPaymentCreated={handlePaymentCreated} />
          </div>
        );
      
      case 'payment':
        return currentPayment ? (
          <PixPayment
            payment={currentPayment}
            onPaymentApproved={handlePaymentApproved}
            onBack={handleBackToPlans}
          />
        ) : null;
      
      case 'success':
        return (
          <div className="max-w-md mx-auto text-center py-12">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pagamento Aprovado!</h2>
              <p className="text-gray-600">
                Sua assinatura foi ativada com sucesso. Redirecionando...
              </p>
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderStep()}
    </div>
  );
};

export default PaymentSystem;
