import express from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = express.Router();

// Rota para verificar se o token é válido
router.post('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token válido',
    user: req.user
  });
});

// Rota para obter informações do usuário autenticado
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Rota de status (pode ser acessada com ou sem autenticação)
router.get('/status', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'API de autenticação funcionando',
    authenticated: !!req.user,
    user: req.user || null,
    timestamp: new Date().toISOString()
  });
});

export default router;
