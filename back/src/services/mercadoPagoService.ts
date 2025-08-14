import { MercadoPagoConfig, Payment } from 'mercadopago';

// Configuração do Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
  options: {
    timeout: 5000,
    idempotencyKey: 'test'
  }
});

const payment = new Payment(client);

export interface CreatePixPaymentData {
  amount: number;
  description: string;
  userId: string;
  userEmail: string;
  externalReference: string;
}

export interface PixPaymentResponse {
  id: string;
  status: string;
  pixCode: string;
  qrCodeBase64: string;
  expirationDate: string;
}

class MercadoPagoService {
  async createPixPayment(data: CreatePixPaymentData): Promise<PixPaymentResponse> {
    try {
      const webhookUrl = process.env.MERCADO_PAGO_WEBHOOK_URL;
      
      const paymentData: any = {
        transaction_amount: data.amount,
        description: data.description,
        payment_method_id: 'pix',
        external_reference: data.externalReference,
        payer: {
          email: data.userEmail,
          first_name: 'Cliente',
          last_name: 'WhatsApp Bot',
          identification: {
            type: 'CPF',
            number: '12345678901' // Será substituído por dados reais se necessário
          }
        },
        date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutos
      };

      // Adicionar notification_url apenas se estiver definida
      if (webhookUrl) {
        paymentData.notification_url = webhookUrl;
      }

      const response = await payment.create({ body: paymentData });

      if (!response.point_of_interaction?.transaction_data) {
        throw new Error('Erro ao gerar PIX: dados de transação não encontrados');
      }

      return {
        id: response.id?.toString() || '',
        status: response.status || 'pending',
        pixCode: response.point_of_interaction.transaction_data.qr_code || '',
        qrCodeBase64: response.point_of_interaction.transaction_data.qr_code_base64 || '',
        expirationDate: response.date_of_expiration || ''
      };
    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error);
      throw new Error('Falha ao criar pagamento PIX');
    }
  }

  async getPaymentStatus(paymentId: string) {
    try {
      const response = await payment.get({ id: paymentId });
      return {
        id: response.id?.toString() || '',
        status: response.status || 'pending',
        statusDetail: response.status_detail || '',
        transactionAmount: response.transaction_amount || 0,
        dateApproved: response.date_approved || null,
        externalReference: response.external_reference || ''
      };
    } catch (error) {
      console.error('Erro ao consultar status do pagamento:', error);
      throw new Error('Falha ao consultar status do pagamento');
    }
  }

  async processWebhook(webhookData: any) {
    try {
      if (webhookData.type === 'payment') {
        const paymentId = webhookData.data.id;
        return await this.getPaymentStatus(paymentId);
      }
      return null;
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      throw new Error('Falha ao processar webhook do Mercado Pago');
    }
  }
}

export default new MercadoPagoService();
