import { Router } from 'express';
import sessionRoutes from './sessionRoutes';
import qrRoutes from './qrRoutes';
import authRoutes from './auth';
import messageRoutes from './messageRoutes';

const router = Router();

// Rota raiz
router.get('/', (req, res) => {
    res.json({
        message: 'Bot WhatsApp Multi-Sessões - API funcionando!',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            sessions: '/api/sessions',
            qr: '/api/sessions/:id/qr',
            messages: '/api/messages'
        },
        timestamp: new Date().toISOString()
    });
});

// Agrupar rotas
router.use('/auth', authRoutes);           // Rotas de autenticação
router.use('/sessions', sessionRoutes);    // Rotas de sessões
router.use('/sessions', qrRoutes);         // Rotas de QR Code
router.use('/messages', messageRoutes);    // Rotas de mensagens

export default router;
