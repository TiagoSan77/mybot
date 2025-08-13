import cron from 'node-cron';
import { ScheduledMessage, IScheduledMessage } from '../models/ScheduledMessage';
import { MessageTemplate } from '../models/MessageTemplate';
import WhatsAppService from './whatsappService';
import { v4 as uuidv4 } from 'uuid';

export class SchedulerService {
    private static instance: SchedulerService;
    private cronJob: any | null = null;

    private constructor() {
        this.initializeScheduler();
    }

    public static getInstance(): SchedulerService {
        if (!SchedulerService.instance) {
            SchedulerService.instance = new SchedulerService();
        }
        return SchedulerService.instance;
    }

    private initializeScheduler(): void {
        // Executa a cada minuto para verificar mensagens pendentes
        this.cronJob = cron.schedule('* * * * *', async () => {
            await this.processPendingMessages();
        });

        console.log('📅 Agendador de mensagens iniciado - verificando a cada minuto');
    }

    public async scheduleMessage(data: {
        userId: string;
        sessionId: string;
        recipientNumber: string;
        recipientName?: string;
        templateId?: string;
        messageContent?: string;
        scheduledDate: Date;
    }): Promise<IScheduledMessage> {
        let finalMessageContent = data.messageContent || '';

        // Se foi fornecido um templateId, buscar o conteúdo do template
        if (data.templateId) {
            const template = await MessageTemplate.findOne({
                templateId: data.templateId,
                userId: data.userId,
                isActive: true
            });

            if (!template) {
                throw new Error('Template não encontrado ou inativo');
            }

            finalMessageContent = template.content;
            
            // Incrementar contador de uso do template
            await MessageTemplate.findByIdAndUpdate(template._id, {
                $inc: { usageCount: 1 }
            });
        }

        if (!finalMessageContent.trim()) {
            throw new Error('Conteúdo da mensagem é obrigatório');
        }

        // Validar se a data é futura
        if (data.scheduledDate <= new Date()) {
            throw new Error('A data de agendamento deve ser futura');
        }

        const scheduledMessage = new ScheduledMessage({
            messageId: uuidv4(),
            userId: data.userId,
            sessionId: data.sessionId,
            recipientNumber: data.recipientNumber,
            recipientName: data.recipientName,
            templateId: data.templateId,
            messageContent: finalMessageContent,
            scheduledDate: data.scheduledDate,
            status: 'pending'
        });

        await scheduledMessage.save();
        
        console.log(`📅 Mensagem agendada para ${data.scheduledDate.toLocaleString('pt-BR')} - Destinatário: ${data.recipientNumber}`);
        
        return scheduledMessage;
    }

    private async processPendingMessages(): Promise<void> {
        try {
            const now = new Date();
            
            // Buscar mensagens pendentes que devem ser enviadas agora
            const pendingMessages = await ScheduledMessage.find({
                status: 'pending',
                scheduledDate: { $lte: now },
                attempts: { $lt: 3 } // Máximo 3 tentativas
            }).sort({ scheduledDate: 1 });

            if (pendingMessages.length === 0) {
                return;
            }

            console.log(`📅 Processando ${pendingMessages.length} mensagem(ns) agendada(s)`);

            for (const message of pendingMessages) {
                await this.sendScheduledMessage(message);
            }
        } catch (error) {
            console.error('❌ Erro ao processar mensagens agendadas:', error);
        }
    }

    private async sendScheduledMessage(message: IScheduledMessage): Promise<void> {
        try {
            // Incrementar tentativas
            message.attempts += 1;
            await message.save();

            const whatsappService = WhatsAppService.getInstance();
            
            // Verificar se a sessão está ativa
            const sessions = whatsappService.getSessions();
            const session = sessions.find(s => s.id === message.sessionId);

            if (!session) {
                throw new Error(`Sessão ${message.sessionId} não encontrada`);
            }

            // Verificar se há um cliente ativo para esta sessão
            // Note: Vou implementar um método público no WhatsAppService para acessar o cliente
            const sessionStatus = whatsappService.getSessionStatus(message.sessionId);
            if (!sessionStatus.isActive) {
                throw new Error(`Sessão ${message.sessionId} não está ativa`);
            }

            // Formatar número para WhatsApp
            const formattedNumber = this.formatPhoneNumber(message.recipientNumber);
            
            // Enviar mensagem usando o WhatsAppService
            await whatsappService.sendMessage(message.sessionId, formattedNumber, message.messageContent);

            // Atualizar status para enviado
            message.status = 'sent';
            message.sentAt = new Date();
            await message.save();

            console.log(`✅ Mensagem agendada enviada com sucesso para ${message.recipientNumber}`);

        } catch (error) {
            console.error(`❌ Erro ao enviar mensagem agendada para ${message.recipientNumber}:`, error);

            // Atualizar com erro
            message.errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

            // Se excedeu o máximo de tentativas, marcar como falhou
            if (message.attempts >= message.maxAttempts) {
                message.status = 'failed';
                console.log(`❌ Mensagem para ${message.recipientNumber} falhou após ${message.attempts} tentativas`);
            }

            await message.save();
        }
    }

    private formatPhoneNumber(number: string): string {
        // Remove caracteres especiais
        let cleanNumber = number.replace(/\D/g, '');
        
        // Se não tem código do país, adiciona 55 (Brasil)
        if (cleanNumber.length === 11 && cleanNumber.startsWith('1')) {
            cleanNumber = '55' + cleanNumber;
        } else if (cleanNumber.length === 10) {
            cleanNumber = '551' + cleanNumber;
        } else if (cleanNumber.length === 11 && !cleanNumber.startsWith('55')) {
            cleanNumber = '55' + cleanNumber;
        }
        
        return cleanNumber + '@c.us';
    }

    public async getUserScheduledMessages(userId: string, status?: string): Promise<IScheduledMessage[]> {
        const filter: any = { userId };
        
        if (status) {
            filter.status = status;
        }

        return await ScheduledMessage.find(filter)
            .sort({ scheduledDate: -1 })
            .populate('templateId');
    }

    public async cancelScheduledMessage(messageId: string, userId: string): Promise<boolean> {
        const message = await ScheduledMessage.findOne({ 
            messageId, 
            userId,
            status: 'pending'
        });

        if (!message) {
            return false;
        }

        message.status = 'cancelled';
        await message.save();

        console.log(`🚫 Mensagem agendada cancelada: ${messageId}`);
        return true;
    }

    public async updateScheduledMessage(messageId: string, userId: string, updates: {
        scheduledDate?: Date;
        messageContent?: string;
        recipientNumber?: string;
        recipientName?: string;
    }): Promise<IScheduledMessage | null> {
        const message = await ScheduledMessage.findOne({ 
            messageId, 
            userId,
            status: 'pending'
        });

        if (!message) {
            return null;
        }

        // Validar nova data se fornecida
        if (updates.scheduledDate && updates.scheduledDate <= new Date()) {
            throw new Error('A nova data de agendamento deve ser futura');
        }

        Object.assign(message, updates);
        message.updatedAt = new Date();
        
        await message.save();
        
        console.log(`📝 Mensagem agendada atualizada: ${messageId}`);
        return message;
    }

    public stopScheduler(): void {
        if (this.cronJob) {
            this.cronJob.stop();
            console.log('📅 Agendador de mensagens parado');
        }
    }

    public startScheduler(): void {
        if (this.cronJob) {
            this.cronJob.start();
            console.log('📅 Agendador de mensagens reiniciado');
        }
    }

    public getSchedulerStatus(): { isRunning: boolean; nextExecution?: Date } {
        const isRunning = this.cronJob ? Boolean(this.cronJob.running) : false;
        
        const result: { isRunning: boolean; nextExecution?: Date } = {
            isRunning
        };
        
        if (this.cronJob && isRunning) {
            result.nextExecution = new Date(Date.now() + 60000);
        }
        
        return result;
    }
}

export default SchedulerService;
