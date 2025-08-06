import { Router } from 'express';
import QRController from '../controllers/qrController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const qrController = new QRController();

// Rotas de QR Code (todas requerem autenticação)
router.get('/:id/qr', authenticateToken, qrController.getQRCode);
router.get('/:id/qr/base64', authenticateToken, qrController.getQRCodeBase64);
router.get('/:id/qr/image', authenticateToken, qrController.getQRCodeImage);

export default router;
