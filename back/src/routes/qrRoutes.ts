import { Router } from 'express';
import QRController from '../controllers/qrController';

const router = Router();
const qrController = new QRController();

// Rotas de QR Code
router.get('/:id/qr', qrController.getQRCode);
router.get('/:id/qr/base64', qrController.getQRCodeBase64);
router.get('/:id/qr/image', qrController.getQRCodeImage);

export default router;
