import { Router } from 'express';
import SessionController from '../controllers/sessionController';

const router = Router();
const sessionController = new SessionController();

// Rotas de sessão
router.post('/', sessionController.createSession);
router.get('/', sessionController.listSessions);
router.get('/:id/status', sessionController.getSessionStatus);
router.delete('/:id', sessionController.deleteSession);

export default router;
