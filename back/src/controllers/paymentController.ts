import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Plan from '../models/Plan';
import Payment from '../models/Payment';
import mercadoPagoService from '../services/mercadoPagoService';
import subscriptionService from '../services/subscriptionService';

export const getPlans = async (req: Request, res: Response) => {
  try {
    const plans = await subscriptionService.getActivePlans();
    res.json(plans);
  } catch (error) {
    console.error('Erro ao obter planos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { planId, months = 1 } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const userId = user.uid;

    if (!planId || !months) {
      return res.status(400).json({ error: 'Plano e quantidade de meses são obrigatórios' });
    }

    if (months < 1 || months > 12) {
      return res.status(400).json({ error: 'Quantidade de meses deve ser entre 1 e 12' });
    }

    // Verificar se o plano existe
    const plan = await Plan.findOne({ id: planId, active: true });
    if (!plan) {
      return res.status(404).json({ error: 'Plano não encontrado' });
    }

    // Calcular valor total
    const totalAmount = plan.price * months;

    // Gerar referência única
    const externalReference = `${userId}_${planId}_${Date.now()}`;

    // Criar pagamento no Mercado Pago
    const pixPayment = await mercadoPagoService.createPixPayment({
      amount: totalAmount,
      description: `${plan.name} - ${months} mês(es) - ${plan.devices} dispositivo(s)`,
      userId,
      userEmail: user.email || 'cliente@whatsappbot.com',
      externalReference
    });

    // Salvar pagamento no banco
    const payment = new Payment({
      userId,
      planId,
      months,
      amount: totalAmount,
      mercadoPagoId: pixPayment.id,
      pixCode: pixPayment.pixCode,
      pixQrCode: pixPayment.qrCodeBase64,
      status: 'pending',
      paymentMethod: 'pix',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
    });

    await payment.save();

    res.status(201).json({
      paymentId: payment._id,
      mercadoPagoId: pixPayment.id,
      pixCode: pixPayment.pixCode,
      pixQrCode: pixPayment.qrCodeBase64,
      amount: totalAmount,
      expiresAt: payment.expiresAt,
      plan: {
        name: plan.name,
        devices: plan.devices,
        months
      }
    });
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    res.status(500).json({ error: 'Erro ao processar pagamento' });
  }
};

export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const userId = user.uid;

    const payment = await Payment.findOne({
      _id: paymentId,
      userId
    }).populate('planId', 'name devices price');

    if (!payment) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    // Verificar status no Mercado Pago se ainda estiver pendente
    if (payment.status === 'pending') {
      try {
        const mpStatus = await mercadoPagoService.getPaymentStatus(payment.mercadoPagoId);
        
        if (mpStatus.status !== payment.status) {
          payment.status = mpStatus.status as any;
          payment.mercadoPagoData = mpStatus;
          
          if (mpStatus.status === 'approved') {
            payment.approvedAt = new Date();
            // Ativar assinatura
            await subscriptionService.activateSubscription(payment.mercadoPagoId);
          }
          
          await payment.save();
        }
      } catch (error) {
        console.error('Erro ao verificar status no MP:', error);
      }
    }

    res.json({
      id: payment._id,
      status: payment.status,
      amount: payment.amount,
      pixCode: payment.pixCode,
      pixQrCode: payment.pixQrCode,
      expiresAt: payment.expiresAt,
      approvedAt: payment.approvedAt,
      plan: payment.planId,
      months: payment.months
    });
  } catch (error) {
    console.error('Erro ao obter status do pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getUserSubscription = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const userId = user.uid;

    const subscription = await subscriptionService.getUserActiveSubscription(userId);
    
    if (!subscription) {
      return res.json({ subscription: null });
    }

    const deviceLimits = await subscriptionService.canUserCreateSession(userId);

    res.json({
      subscription: {
        id: subscription._id,
        planId: subscription.planId,
        devices: subscription.devices,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        autoRenew: subscription.autoRenew
      },
      deviceLimits
    });
  } catch (error) {
    console.error('Erro ao obter assinatura do usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getUserPayments = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const userId = user.uid;

    const payments = await Payment.find({ userId })
      .populate('planId', 'name devices price')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(payments);
  } catch (error) {
    console.error('Erro ao obter pagamentos do usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Webhook do Mercado Pago
export const webhookMercadoPago = async (req: Request, res: Response) => {
  try {
    const webhookData = req.body;
    
    console.log('Webhook recebido:', JSON.stringify(webhookData, null, 2));

    if (webhookData.type === 'payment') {
      const paymentId = webhookData.data.id;
      
      // Buscar pagamento no banco
      const payment = await Payment.findOne({ mercadoPagoId: paymentId });
      
      if (payment) {
        // Verificar status atualizado
        const mpStatus = await mercadoPagoService.getPaymentStatus(paymentId);
        
        payment.status = mpStatus.status as any;
        payment.mercadoPagoData = mpStatus;
        
        if (mpStatus.status === 'approved' && !payment.approvedAt) {
          payment.approvedAt = new Date();
          // Ativar assinatura
          await subscriptionService.activateSubscription(paymentId);
        }
        
        await payment.save();
        
        console.log(`Pagamento ${paymentId} atualizado para status: ${mpStatus.status}`);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
};
