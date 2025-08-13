import express from 'express';
import authMiddleware from '../middleware/auth';
import ScheduledMessageController from '../controllers/scheduledMessageController';

const router = express.Router();
const scheduledMessageController = new ScheduledMessageController();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware.authenticateToken);

// Criar nova mensagem agendada
router.post('/', scheduledMessageController.scheduleMessage);

// Listar mensagens agendadas do usuário
router.get('/', scheduledMessageController.getScheduledMessages);

// Obter templates disponíveis para agendamento
router.get('/templates', scheduledMessageController.getTemplatesForScheduling);

// Obter status do agendador
router.get('/scheduler/status', scheduledMessageController.getSchedulerStatus);

// Atualizar mensagem agendada
router.put('/:messageId', scheduledMessageController.updateScheduledMessage);

// Cancelar mensagem agendada
router.delete('/:messageId', scheduledMessageController.cancelScheduledMessage);

export { router as scheduledMessageRoutes };
