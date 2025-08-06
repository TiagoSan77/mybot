import { Router } from 'express';
import sessionRoutes from './sessionRoutes';
import qrRoutes from './qrRoutes';

const router = Router();

// Rota raiz
router.get('/', (req, res) => {
    res.send('Bot WhatsApp Multi-Sessões - API funcionando!');
});

// Agrupar rotas
router.use('/sessions', sessionRoutes);
router.use('/sessions', qrRoutes);

export default router;
