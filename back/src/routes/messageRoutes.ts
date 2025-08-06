import express from 'express';
import MessageController from '../controllers/messageController';
import authMiddleware from '../middleware/auth';

const router = express.Router();
const messageController = new MessageController();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware.authenticateToken);

/**
 * @route POST /messages/send
 * @desc Enviar mensagem através de uma sessão específica
 * @access Private (requer autenticação)
 * @body {sessionId: string, phoneNumber: string, message: string}
 */
router.post('/send', messageController.sendMessage);

/**
 * @route GET /messages/session/:sessionId
 * @desc Obter informações sobre uma sessão para envio de mensagens
 * @access Private (requer autenticação)
 * @param sessionId - ID da sessão
 */
router.get('/session/:sessionId', messageController.getSessionInfo);

export default router;
