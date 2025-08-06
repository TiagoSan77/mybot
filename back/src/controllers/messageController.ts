import { Request, Response } from 'express';
import WhatsAppService from '../services/whatsappService';
import '../middleware/auth'; // Para incluir a extensão do Request

interface SendMessageRequest {
    sessionId: string;
    phoneNumber: string;
    message: string;
}

class MessageController {
    private whatsappService: WhatsAppService;

    constructor() {
        this.whatsappService = WhatsAppService.getInstance();
    }

    // Enviar mensagem através de uma sessão específica
    public sendMessage = async (req: Request, res: Response): Promise<void> => {
        try {
            const { sessionId, phoneNumber, message } = req.body as SendMessageRequest;
            const user = req.user;

            console.log(`📤 Tentativa de envio - SessionID: ${sessionId}, Phone: ${phoneNumber}, User: ${user?.email || 'não logado'}`);

            // Validações básicas
            if (!user) {
                res.status(401).json({ 
                    error: 'Autenticação requerida',
                    message: 'Faça login para enviar mensagens'
                });
                return;
            }

            if (!sessionId || !phoneNumber || !message) {
                res.status(400).json({ 
                    error: 'Dados obrigatórios não fornecidos',
                    required: { 
                        sessionId: 'string', 
                        phoneNumber: 'string', 
                        message: 'string' 
                    }
                });
                return;
            }

            // Verificar se a sessão existe
            if (!this.whatsappService.sessionExists(sessionId)) {
                console.log(`❌ Sessão '${sessionId}' não encontrada`);
                res.status(404).json({ 
                    error: `Sessão '${sessionId}' não encontrada` 
                });
                return;
            }

            // Verificar se a sessão pertence ao usuário
            const session = this.whatsappService.findSession(sessionId);
            if (session && session.userId !== user.uid) {
                console.log(`❌ Acesso negado - User: ${user.email}, Session Owner: ${session.userEmail}`);
                res.status(403).json({ 
                    error: 'Acesso negado',
                    message: 'Você só pode enviar mensagens através das suas próprias sessões'
                });
                return;
            }

            // Verificar se a sessão está ativa/conectada
            const sessionStatus = this.whatsappService.getSessionStatus(sessionId);
            if (!sessionStatus.isActive) {
                console.log(`❌ Sessão '${sessionId}' não está ativa`);
                res.status(400).json({ 
                    error: 'Sessão não está ativa',
                    message: 'A sessão precisa estar conectada ao WhatsApp para enviar mensagens',
                    sessionStatus
                });
                return;
            }

            if (sessionStatus.status !== 'connected') {
                console.log(`❌ Sessão '${sessionId}' não está conectada - Status: ${sessionStatus.status}`);
                res.status(400).json({ 
                    error: 'Sessão não está conectada',
                    message: 'A sessão precisa estar autenticada no WhatsApp para enviar mensagens',
                    sessionStatus
                });
                return;
            }

            // Enviar mensagem
            const result = await this.whatsappService.sendMessage(sessionId, phoneNumber, message);
            
            console.log(`✅ Mensagem enviada - SessionID: ${sessionId}, Phone: ${phoneNumber}, User: ${user.email}`);

            res.json({
                success: true,
                message: 'Mensagem enviada com sucesso',
                data: {
                    sessionId,
                    phoneNumber,
                    messageLength: message.length,
                    sentAt: new Date(),
                    sentBy: user.email,
                    messageId: result.id || 'unknown'
                }
            });

        } catch (error: any) {
            console.error('Erro ao enviar mensagem:', error);
            
            // Tratar erros específicos do WhatsApp
            if (error.message.includes('not authenticated') || error.message.includes('not connected')) {
                res.status(400).json({ 
                    error: 'Sessão não autenticada',
                    message: 'A sessão WhatsApp não está autenticada. Escaneie o QR code primeiro.',
                    details: error.message 
                });
                return;
            }

            if (error.message.includes('Invalid number') || error.message.includes('not a valid number')) {
                res.status(400).json({ 
                    error: 'Número de telefone inválido',
                    message: 'O número fornecido não é válido. Use o formato: 5511999999999',
                    details: error.message 
                });
                return;
            }

            res.status(500).json({ 
                error: 'Erro interno do servidor',
                message: 'Ocorreu um erro ao enviar a mensagem',
                details: error.message 
            });
        }
    };

    // Obter informações sobre uma sessão para envio
    public getSessionInfo = (req: Request, res: Response): void => {
        const { sessionId } = req.params;
        const user = req.user;

        if (!user) {
            res.status(401).json({ 
                error: 'Autenticação requerida',
                message: 'Faça login para ver informações da sessão'
            });
            return;
        }

        if (!sessionId) {
            res.status(400).json({ 
                error: 'SessionId é obrigatório'
            });
            return;
        }

        const session = this.whatsappService.findSession(sessionId);
        if (!session) {
            res.status(404).json({ 
                error: `Sessão '${sessionId}' não encontrada` 
            });
            return;
        }

        // Verificar se a sessão pertence ao usuário
        if (session.userId !== user.uid) {
            res.status(403).json({ 
                error: 'Acesso negado',
                message: 'Você só pode ver informações das suas próprias sessões'
            });
            return;
        }

        const sessionStatus = this.whatsappService.getSessionStatus(sessionId);

        res.json({
            session: {
                id: session.id,
                name: session.name,
                createdAt: session.createdAt
            },
            status: sessionStatus,
            canSendMessages: sessionStatus.isActive && sessionStatus.status === 'connected',
            instructions: {
                ready: sessionStatus.status === 'connected' ? 'Sessão pronta para envio de mensagens' : null,
                qrPending: sessionStatus.status === 'waiting_qr' ? 'Escaneie o QR code para ativar a sessão' : null,
                disconnected: sessionStatus.status === 'disconnected' ? 'Sessão desconectada. Reinicie a sessão.' : null
            }
        });
    };
}

export default MessageController;
