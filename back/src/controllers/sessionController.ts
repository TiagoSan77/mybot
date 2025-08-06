import { Request, Response } from 'express';
import WhatsAppService from '../services/whatsappService';
import { Session, SessionWithStatus } from '../types/session';

class SessionController {
    private whatsappService: WhatsAppService;

    constructor() {
        this.whatsappService = WhatsAppService.getInstance();
    }

    // Criar nova sessão
    public createSession = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id, name } = req.body;

            // Validações
            if (!id || !name) {
                res.status(400).json({ 
                    error: 'ID e nome da sessão são obrigatórios',
                    required: { id: 'string', name: 'string' }
                });
                return;
            }

            if (this.whatsappService.sessionExists(id)) {
                res.status(409).json({ 
                    error: `Sessão com ID '${id}' já existe` 
                });
                return;
            }

            // Criar nova sessão
            const newSession: Session = { id, name };
            await this.whatsappService.createSession(newSession);

            res.status(201).json({
                message: 'Sessão criada com sucesso',
                session: newSession,
                status: 'initializing'
            });

        } catch (error: any) {
            console.error('Erro ao criar sessão:', error);
            res.status(500).json({ 
                error: 'Erro interno do servidor',
                details: error.message 
            });
        }
    };

    // Listar todas as sessões
    public listSessions = (req: Request, res: Response): void => {
        const sessions = this.whatsappService.getSessions();
        const activeClients = this.whatsappService.getActiveClients();
        const qrCodes = this.whatsappService.getQRCodes();

        const sessionsWithStatus: SessionWithStatus[] = sessions.map(session => ({
            ...session,
            isActive: activeClients.has(session.id),
            hasQRCode: qrCodes.has(session.id)
        }));

        res.json({
            total: sessions.length,
            sessions: sessionsWithStatus
        });
    };

    // Verificar status de uma sessão
    public getSessionStatus = (req: Request, res: Response): void => {
        const { id } = req.params as { id: string };
        
        const session = this.whatsappService.findSession(id);
        if (!session) {
            res.status(404).json({ 
                error: `Sessão '${id}' não encontrada` 
            });
            return;
        }

        const statusInfo = this.whatsappService.getSessionStatus(id);

        res.json({
            session,
            ...statusInfo
        });
    };

    // Deletar uma sessão
    public deleteSession = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params as { id: string };
            
            const deleted = await this.whatsappService.deleteSession(id);
            if (!deleted) {
                res.status(404).json({ 
                    error: `Sessão '${id}' não encontrada` 
                });
                return;
            }

            res.json({
                message: `Sessão '${id}' removida com sucesso`
            });

        } catch (error: any) {
            console.error('Erro ao deletar sessão:', error);
            res.status(500).json({ 
                error: 'Erro interno do servidor',
                details: error.message 
            });
        }
    };
}

export default SessionController;
