import { Request, Response } from 'express';
import WhatsAppService from '../services/whatsappService';

class QRController {
    private whatsappService: WhatsAppService;

    constructor() {
        this.whatsappService = WhatsAppService.getInstance();
    }

    // Obter QR Code com metadados completos
    public getQRCode = (req: Request, res: Response): void => {
        const { id } = req.params as { id: string };
        
        if (!this.whatsappService.sessionExists(id)) {
            res.status(404).json({ 
                error: `Sessão '${id}' não encontrada` 
            });
            return;
        }

        const qrCode = this.whatsappService.getQRCodes().get(id);
        if (!qrCode) {
            res.status(404).json({ 
                error: `QR Code não disponível para a sessão '${id}'`,
                message: 'Sessão pode já estar autenticada ou ainda não inicializada'
            });
            return;
        }

        res.json({
            sessionId: id,
            qrCode: qrCode,
            message: 'Escaneie este QR Code com seu WhatsApp'
        });
    };

    // Retornar apenas o código base64 (sem prefixo data:image)
    public getQRCodeBase64 = (req: Request, res: Response): void => {
        const { id } = req.params as { id: string };
        
        if (!this.whatsappService.sessionExists(id)) {
            res.status(404).json({ 
                error: `Sessão '${id}' não encontrada` 
            });
            return;
        }

        const qrCode = this.whatsappService.getQRCodes().get(id);
        if (!qrCode) {
            res.status(404).json({ 
                error: `QR Code não disponível para a sessão '${id}'`,
                message: 'Sessão pode já estar autenticada ou ainda não inicializada'
            });
            return;
        }

        // Extrair apenas o base64 (remover o prefixo data:image/png;base64,)
        const base64Only = qrCode.replace(/^data:image\/png;base64,/, "");
        
        res.setHeader('Content-Type', 'text/plain');
        res.send(base64Only);
    };

    // Retornar QR Code como imagem PNG
    public getQRCodeImage = (req: Request, res: Response): void => {
        const { id } = req.params as { id: string };
        
        if (!this.whatsappService.sessionExists(id)) {
            res.status(404).json({ 
                error: `Sessão '${id}' não encontrada` 
            });
            return;
        }

        const qrCode = this.whatsappService.getQRCodes().get(id);
        if (!qrCode) {
            res.status(404).json({ 
                error: `QR Code não disponível para a sessão '${id}'`,
                message: 'Sessão pode já estar autenticada ou ainda não inicializada'
            });
            return;
        }

        // Extrair apenas o base64
        const base64Only = qrCode.replace(/^data:image\/png;base64,/, "");
        const imageBuffer = Buffer.from(base64Only, 'base64');
        
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Length', imageBuffer.length);
        res.send(imageBuffer);
    };
}

export default QRController;
