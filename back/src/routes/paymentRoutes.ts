import express from 'express';
import { authenticateToken } from '../middleware/auth';
import * as paymentController from '../controllers/paymentController';

const router = express.Router();

// Rotas protegidas por autenticação
router.get('/plans', authenticateToken, paymentController.getPlans);
router.post('/create', authenticateToken, paymentController.createPayment);
router.get('/payment/:paymentId/status', authenticateToken, paymentController.getPaymentStatus);
router.get('/subscription', authenticateToken, paymentController.getUserSubscription);
router.get('/history', authenticateToken, paymentController.getUserPayments);

// Webhook público (sem autenticação)
router.post('/webhook/mercadopago', paymentController.webhookMercadoPago);

export default router;
