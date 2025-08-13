import { Request, Response } from 'express';
import { SchedulerService } from '../services/schedulerService';
import { MessageTemplate } from '../models/MessageTemplate';

export class ScheduledMessageController {
    private schedulerService: SchedulerService;

    constructor() {
        this.schedulerService = SchedulerService.getInstance();
    }

    // Criar uma nova mensagem agendada
    public scheduleMessage = async (req: Request, res: Response): Promise<void> => {
        try {
            const { 
                sessionId, 
                recipientNumber, 
                recipientName,
                templateId, 
                messageContent, 
                scheduledDate 
            } = req.body;

            // Validações básicas
            if (!sessionId || !recipientNumber || !scheduledDate) {
                res.status(400).json({
                    success: false,
                    message: 'sessionId, recipientNumber e scheduledDate são obrigatórios'
                });
                return;
            }

            if (!templateId && !messageContent) {
                res.status(400).json({
                    success: false,
                    message: 'É necessário fornecer um templateId ou messageContent'
                });
                return;
            }

            const userId = (req as any).user?.uid;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado'
                });
                return;
            }

            // Converter string de data para Date object
            const scheduledDateTime = new Date(scheduledDate);
            if (isNaN(scheduledDateTime.getTime())) {
                res.status(400).json({
                    success: false,
                    message: 'Data de agendamento inválida'
                });
                return;
            }

            const scheduledMessage = await this.schedulerService.scheduleMessage({
                userId,
                sessionId,
                recipientNumber,
                recipientName,
                templateId,
                messageContent,
                scheduledDate: scheduledDateTime
            });

            res.status(201).json({
                success: true,
                message: 'Mensagem agendada com sucesso',
                data: scheduledMessage
            });

        } catch (error) {
            console.error('Erro ao agendar mensagem:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    };

    // Listar mensagens agendadas do usuário
    public getScheduledMessages = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user?.uid;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado'
                });
                return;
            }

            const { status } = req.query;
            const statusFilter = typeof status === 'string' ? status : undefined;
            const scheduledMessages = await this.schedulerService.getUserScheduledMessages(
                userId, 
                statusFilter
            );

            res.json({
                success: true,
                data: scheduledMessages
            });

        } catch (error) {
            console.error('Erro ao buscar mensagens agendadas:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    };

    // Cancelar mensagem agendada
    public cancelScheduledMessage = async (req: Request, res: Response): Promise<void> => {
        try {
            const { messageId } = req.params;
            const userId = (req as any).user?.uid;

            if (!messageId) {
                res.status(400).json({
                    success: false,
                    message: 'ID da mensagem é obrigatório'
                });
                return;
            }

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado'
                });
                return;
            }

            const cancelled = await this.schedulerService.cancelScheduledMessage(messageId, userId);

            if (!cancelled) {
                res.status(404).json({
                    success: false,
                    message: 'Mensagem agendada não encontrada ou já foi processada'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Mensagem agendada cancelada com sucesso'
            });

        } catch (error) {
            console.error('Erro ao cancelar mensagem agendada:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    };

    // Atualizar mensagem agendada
    public updateScheduledMessage = async (req: Request, res: Response): Promise<void> => {
        try {
            const { messageId } = req.params;
            const userId = (req as any).user?.uid;
            const updates = req.body;

            if (!messageId) {
                res.status(400).json({
                    success: false,
                    message: 'ID da mensagem é obrigatório'
                });
                return;
            }

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado'
                });
                return;
            }

            // Converter scheduledDate se fornecida
            if (updates.scheduledDate) {
                updates.scheduledDate = new Date(updates.scheduledDate);
                if (isNaN(updates.scheduledDate.getTime())) {
                    res.status(400).json({
                        success: false,
                        message: 'Data de agendamento inválida'
                    });
                    return;
                }
            }

            const updatedMessage = await this.schedulerService.updateScheduledMessage(
                messageId, 
                userId, 
                updates
            );

            if (!updatedMessage) {
                res.status(404).json({
                    success: false,
                    message: 'Mensagem agendada não encontrada ou já foi processada'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Mensagem agendada atualizada com sucesso',
                data: updatedMessage
            });

        } catch (error) {
            console.error('Erro ao atualizar mensagem agendada:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erro interno do servidor'
            });
        }
    };

    // Obter templates disponíveis para agendamento
    public getTemplatesForScheduling = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user?.uid;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado'
                });
                return;
            }

            const templates = await MessageTemplate.find({
                userId,
                isActive: true
            }).select('templateId name content category tags').sort({ name: 1 });

            res.json({
                success: true,
                data: templates
            });

        } catch (error) {
            console.error('Erro ao buscar templates:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    };

    // Obter status do agendador
    public getSchedulerStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            const status = this.schedulerService.getSchedulerStatus();
            res.json({
                success: true,
                data: status
            });
        } catch (error) {
            console.error('Erro ao obter status do agendador:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    };
}

export default ScheduledMessageController;
