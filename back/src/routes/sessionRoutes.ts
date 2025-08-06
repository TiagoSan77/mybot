import { Router } from 'express';
import SessionController from '../controllers/sessionController';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();
const sessionController = new SessionController();

// Rotas de sessão com autenticação obrigatória
router.post('/', authenticateToken, sessionController.createSession);        // Criar sessão
router.get('/', authenticateToken, sessionController.listSessions);          // Listar sessões
router.get('/:id/status', authenticateToken, sessionController.getSessionStatus); // Status da sessão
router.delete('/:id', authenticateToken, sessionController.deleteSession);   // Deletar sessão

export default router;
