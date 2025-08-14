import { Request, Response } from 'express';
import WhatsAppService from '../services/whatsappService';
import { Session, SessionWithStatus } from '../types/session';
import { randomUUID } from 'crypto';
import subscriptionService from '../services/subscriptionService';
import '../middleware/auth'; // Para incluir a extensão do Request

class SessionController {
    private whatsappService: WhatsAppService;

    constructor() {
        this.whatsappService = WhatsAppService.getInstance();
    }

    // Gerar ID único para sessão
    private generateUniqueSessionId(userId: string): string {
        const timestamp = Date.now();
        const randomStr = randomUUID().substring(0, 8);
        const userPrefix = userId.substring(0, 6);
        
        return `sess_${userPrefix}_${timestamp}_${randomStr}`;
    }

    // Verificar se o ID é único no sistema
    private ensureUniqueSessionId(baseId: string): string {
        let sessionId = baseId;
        let counter = 1;
        
        while (this.whatsappService.sessionExists(sessionId)) {
            sessionId = `${baseId}_${counter}`;
            counter++;
        }
        
        return sessionId;
    }

    // Criar nova sessão
    public createSession = async (req: Request, res: Response): Promise<void> => {
        try {
            const { name } = req.body; // Agora só precisamos do nome
            const user = req.user; // Informações do usuário autenticado

            // Validações
            if (!name) {
                res.status(400).json({ 
                    error: 'Nome da sessão é obrigatório',
                    required: { name: 'string' }
                });
                return;
            }

            if (!user) {
                res.status(401).json({ 
                    error: 'Autenticação requerida',
                    message: 'Faça login para criar sessões'
                });
                return;
            }

            // Verificar limites de dispositivos
            const deviceLimits = await subscriptionService.canUserCreateSession(user.uid);
            
            if (!deviceLimits.canCreate) {
                res.status(403).json({ 
                    error: 'Limite de dispositivos atingido',
                    message: `Você atingiu o limite de ${deviceLimits.maxDevices} dispositivo(s). Atualmente você tem ${deviceLimits.currentCount} sessão(ões) ativa(s).`,
                    currentCount: deviceLimits.currentCount,
                    maxDevices: deviceLimits.maxDevices,
                    needsSubscription: deviceLimits.maxDevices === 0
                });
                return;
            }

            // Gerar ID único automaticamente
            const baseSessionId = this.generateUniqueSessionId(user.uid);
            const sessionId = this.ensureUniqueSessionId(baseSessionId);

            // Criar nova sessão com informações do usuário
            const newSession: Session = { 
                id: sessionId,
                name: name.trim(),
                userId: user.uid,
                userEmail: user.email,
                createdAt: new Date()
            };

            await this.whatsappService.createSession(newSession);

            console.log(`👤 Sessão '${sessionId}' criada pelo usuário: ${user?.email || 'anônimo'}`);

            res.status(201).json({
                message: 'Sessão criada com sucesso',
                session: {
                    id: newSession.id,
                    name: newSession.name,
                    userId: newSession.userId,
                    createdAt: newSession.createdAt
                },
                status: 'initializing',
                createdBy: user?.email || 'sistema'
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
        const user = req.user; // Usuário autenticado (se houver)
        
        if (!user) {
            res.status(401).json({ 
                error: 'Autenticação requerida',
                message: 'Faça login para ver suas sessões'
            });
            return;
        }

        const sessions = this.whatsappService.getSessions();
        const activeClients = this.whatsappService.getActiveClients();
        const qrCodes = this.whatsappService.getQRCodes();

        // Filtrar APENAS as sessões do usuário logado
        const userSessions = sessions.filter(session => session.userId === user.uid);

        const sessionsWithStatus: SessionWithStatus[] = userSessions.map(session => ({
            ...session,
            isActive: activeClients.has(session.id),
            hasQRCode: qrCodes.has(session.id)
        }));

        res.json({
            total: userSessions.length,
            totalGlobal: sessions.length,
            sessions: sessionsWithStatus,
            user: {
                uid: user.uid,
                email: user.email
            }
        });
    };

    // Verificar status de uma sessão
    public getSessionStatus = (req: Request, res: Response): void => {
        const { id } = req.params as { id: string };
        const user = req.user;

        if (!user) {
            res.status(401).json({ 
                error: 'Autenticação requerida',
                message: 'Faça login para ver status das sessões'
            });
            return;
        }
        
        const session = this.whatsappService.findSession(id);
        if (!session) {
            res.status(404).json({ 
                error: `Sessão '${id}' não encontrada` 
            });
            return;
        }

        // Verificar se a sessão pertence ao usuário
        if (session.userId !== user.uid) {
            res.status(403).json({ 
                error: 'Acesso negado',
                message: 'Você só pode ver status das suas próprias sessões'
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
            const user = req.user;

            if (!user) {
                res.status(401).json({ 
                    error: 'Autenticação requerida',
                    message: 'Faça login para deletar sessões'
                });
                return;
            }

            // Verificar se a sessão existe e pertence ao usuário
            const session = this.whatsappService.findSession(id);
            if (!session) {
                res.status(404).json({ 
                    error: `Sessão '${id}' não encontrada` 
                });
                return;
            }

            if (session.userId !== user.uid) {
                res.status(403).json({ 
                    error: 'Acesso negado',
                    message: 'Você só pode deletar suas próprias sessões'
                });
                return;
            }
            
            const deleted = await this.whatsappService.deleteSession(id);
            if (!deleted) {
                res.status(404).json({ 
                    error: `Sessão '${id}' não encontrada` 
                });
                return;
            }

            console.log(`🗑️ Sessão '${id}' removida pelo usuário: ${user.email}`);

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
