import Plan from '../models/Plan';
import Subscription from '../models/Subscription';
import Payment from '../models/Payment';
import { Session } from '../models/Session';

class SubscriptionService {
  // Inicializar planos padrão
  async initializePlans() {
    try {
      const existingPlans = await Plan.countDocuments();
      if (existingPlans === 0) {
        const defaultPlans = [
          {
            id: 'plan_1_device',
            name: 'Plano Básico',
            devices: 1,
            price: 39.00,
            description: '1 dispositivo WhatsApp ativo',
            active: true
          },
          {
            id: 'plan_2_devices',
            name: 'Plano Intermediário',
            devices: 2,
            price: 59.00,
            description: '2 dispositivos WhatsApp ativos',
            active: true
          },
          {
            id: 'plan_3_devices',
            name: 'Plano Avançado',
            devices: 3,
            price: 79.00,
            description: '3 dispositivos WhatsApp ativos',
            active: true
          }
        ];

        await Plan.insertMany(defaultPlans);
        console.log('Planos padrão criados com sucesso');
      }
    } catch (error) {
      console.error('Erro ao inicializar planos:', error);
    }
  }

  // Obter todos os planos ativos
  async getActivePlans() {
    return await Plan.find({ active: true }).sort({ devices: 1 });
  }

  // Obter plano por ID
  async getPlanById(planId: string) {
    return await Plan.findOne({ id: planId, active: true });
  }

  // Verificar assinatura ativa do usuário
  async getUserActiveSubscription(userId: string) {
    return await Subscription.findOne({
      userId,
      status: 'active',
      endDate: { $gt: new Date() }
    }).populate('planId', 'name devices price description');
  }

  // Verificar se o usuário pode criar mais sessões
  async canUserCreateSession(userId: string): Promise<{ canCreate: boolean; currentCount: number; maxDevices: number }> {
    const subscription = await this.getUserActiveSubscription(userId);
    
    if (!subscription) {
      return { canCreate: false, currentCount: 0, maxDevices: 0 };
    }

      // Verificar se o usuário pode criar mais sessões
      const currentSessionsCount = await Session.countDocuments({ userId });
      const maxDevices = subscription.devices;    return {
      canCreate: currentSessionsCount < maxDevices,
      currentCount: currentSessionsCount,
      maxDevices
    };
  }

  // Ativar assinatura após pagamento aprovado
  async activateSubscription(paymentId: string) {
    try {
      const payment = await Payment.findOne({ mercadoPagoId: paymentId });
      if (!payment) {
        throw new Error('Pagamento não encontrado');
      }

      if (payment.status !== 'approved') {
        throw new Error('Pagamento não foi aprovado');
      }

      // Verificar se já existe uma assinatura para este pagamento
      if (payment.subscriptionId) {
        return await Subscription.findById(payment.subscriptionId);
      }

      const plan = await Plan.findOne({ id: payment.planId });
      if (!plan) {
        throw new Error('Plano não encontrado');
      }

      // Verificar se o usuário já tem uma assinatura ativa
      const existingSubscription = await this.getUserActiveSubscription(payment.userId);
      
      let subscription;
      
      if (existingSubscription) {
        // Estender assinatura existente
        const extensionMonths = payment.months;
        const newEndDate = new Date(existingSubscription.endDate);
        newEndDate.setMonth(newEndDate.getMonth() + extensionMonths);

        subscription = await Subscription.findByIdAndUpdate(
          existingSubscription._id,
          {
            endDate: newEndDate,
            devices: Math.max(existingSubscription.devices, plan.devices) // Upgrade se necessário
          },
          { new: true }
        );
      } else {
        // Criar nova assinatura
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + payment.months);

        subscription = new Subscription({
          userId: payment.userId,
          planId: payment.planId,
          devices: plan.devices,
          status: 'active',
          startDate,
          endDate,
          autoRenew: false
        });

        await subscription.save();
      }

      // Vincular assinatura ao pagamento
      if (subscription && subscription._id) {
        payment.subscriptionId = subscription._id.toString();
        await payment.save();
      }

      return subscription;
    } catch (error) {
      console.error('Erro ao ativar assinatura:', error);
      throw error;
    }
  }

  // Verificar assinaturas expiradas (executar periodicamente)
  async checkExpiredSubscriptions() {
    try {
      const expiredSubscriptions = await Subscription.find({
        status: 'active',
        endDate: { $lt: new Date() }
      });

      for (const subscription of expiredSubscriptions) {
        subscription.status = 'expired';
        await subscription.save();

        // Opcional: Desativar sessões do usuário
        await Session.updateMany(
          { userId: subscription.userId },
          { status: 'disconnected' }
        );

        console.log(`Assinatura expirada para usuário: ${subscription.userId}`);
      }

      return expiredSubscriptions.length;
    } catch (error) {
      console.error('Erro ao verificar assinaturas expiradas:', error);
      return 0;
    }
  }

  // Obter estatísticas de assinaturas
  async getSubscriptionStats() {
    try {
      const totalActive = await Subscription.countDocuments({ status: 'active' });
      const totalExpired = await Subscription.countDocuments({ status: 'expired' });
      const totalCancelled = await Subscription.countDocuments({ status: 'cancelled' });

      const revenueResult = await Payment.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

      return {
        totalActive,
        totalExpired,
        totalCancelled,
        totalRevenue
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        totalActive: 0,
        totalExpired: 0,
        totalCancelled: 0,
        totalRevenue: 0
      };
    }
  }
}

export default new SubscriptionService();
