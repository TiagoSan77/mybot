import { Router } from 'express';
import sessionRoutes from './sessionRoutes';
import qrRoutes from './qrRoutes';
import authRoutes from './auth';
import messageRoutes from './messageRoutes';
import messageTemplateRoutes from './messageTemplateRoutes';
import { scheduledMessageRoutes } from './scheduledMessageRoutes';
import paymentRoutes from './paymentRoutes';

const router = Router();

// Rota raiz
router.get('/', (req, res) => {
    res.json({
        message: 'Bot WhatsApp Multi-Sessões - API funcionando!',
        version: '1.0.0',
        endpoints: {
            auth: '/auth',
            sessions: '/sessions',
            qr: '/sessions/:id/qr',
            messages: '/messages',
            templates: '/templates',
            scheduled: '/scheduled',
            payments: '/payments'
        },
        timestamp: new Date().toISOString()
    });
});

// Agrupar rotas
router.use('/auth', authRoutes);           // Rotas de autenticação
router.use('/sessions', sessionRoutes);    // Rotas de sessões
router.use('/sessions', qrRoutes);         // Rotas de QR Code
router.use('/messages', messageRoutes);    // Rotas de mensagens
router.use('/templates', messageTemplateRoutes); // Rotas de templates
router.use('/scheduled', scheduledMessageRoutes); // Rotas de mensagens agendadas
router.use('/payments', paymentRoutes);    // Rotas de pagamentos

export default router;
