import { Client, RemoteAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode';
import { Session } from '../types/session';
import DatabaseConfig from '../config/database';
import AppConfig from '../config/app';
import mongoose from 'mongoose';
import { Session as SessionModel, ISession } from '../models/Session';

class WhatsAppService {
    private static instance: WhatsAppService;
    private sessions: Session[] = [];
    private activeClients = new Map<string, Client>();
    private qrCodes = new Map<string, string>();
    private config: AppConfig;

    private constructor() {
        this.config = AppConfig.getInstance();
        // Carregar sessões do banco de dados na inicialização
        this.loadSessionsFromDatabase();
    }

    public static getInstance(): WhatsAppService {
        if (!WhatsAppService.instance) {
            WhatsAppService.instance = new WhatsAppService();
        }
        return WhatsAppService.instance;
    }

    // Carregar sessões existentes do MongoDB
    private async loadSessionsFromDatabase(): Promise<void> {
        try {
            const db = DatabaseConfig.getInstance();
            
            // Aguardar conexão se ainda não estiver conectado
            if (!db.isConnected()) {
                console.log('🔄 Aguardando conexão com MongoDB...');
                await new Promise(resolve => setTimeout(resolve, 5000)); // Aumentar tempo de espera
            }

            if (db.isConnected()) {
                // Aguardar um pouco mais para garantir que o store está totalmente carregado
                console.log('⏳ Aguardando inicialização completa do MongoDB store...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                const savedSessions = await SessionModel.find({}).lean();
                console.log(`📂 Encontradas ${savedSessions.length} sessões salvas no MongoDB`);
                
                // Converter para o formato Session e adicionar à memória
                this.sessions = savedSessions.map((doc: any) => ({
                    id: doc.sessionId,
                    name: doc.sessionName || doc.sessionId, // Usar sessionName salvo ou sessionId como fallback
                    userId: doc.userId,
                    userEmail: '', // Buscaremos do User depois se necessário
                    createdAt: doc.createdAt || new Date()
                }));

                console.log(`✅ ${this.sessions.length} sessões carregadas do banco de dados`);
                
                // Reconectar sessões ativas automaticamente
                if (this.sessions.length > 0) {
                    console.log('🔄 Iniciando reconexão automática das sessões...');
                    this.reconnectExistingSessions();
                }
            } else {
                console.log('❌ MongoDB não conectado - sessões não foram carregadas');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar sessões do banco de dados:', error);
        }
    }

    // Reconectar sessões existentes automaticamente
    private async reconnectExistingSessions(): Promise<void> {
        console.log(`🔄 Tentando reconectar ${this.sessions.length} sessões...`);

        for (const session of this.sessions) {
            try {
                console.log(`🔌 Reconectando sessão: ${session.name} (${session.id}) do usuário: ${session.userId}`);
                
                const db = DatabaseConfig.getInstance();
                if (!db.isConnected()) {
                    console.log('❌ MongoDB não conectado - pulando reconexão');
                    continue;
                }

                // Verificar se a sessão já não está ativa
                if (this.activeClients.has(session.id)) {
                    console.log(`⚠️  Sessão ${session.name} já está ativa, pulando reconexão`);
                    continue;
                }

                // Criar cliente WhatsApp
                const client = new Client({
                    authStrategy: new RemoteAuth({
                        store: db.getStore(),
                        backupSyncIntervalMs: this.config.get().backupSyncInterval,
                        clientId: session.id
                    }),
                    puppeteer: {
                        headless: true,
                        args: [
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                            '--disable-dev-shm-usage',
                            '--disable-accelerated-2d-canvas',
                            '--no-first-run',
                            '--no-zygote',
                            '--disable-gpu'
                        ]
                    }
                });

                // Configurar eventos de reconexão
                this.setupReconnectionEvents(client, session);
                
                // Adicionar à lista de clientes ativos
                this.activeClients.set(session.id, client);

                // Inicializar cliente
                await client.initialize();
                console.log(`✅ Sessão ${session.name} (${session.id}) inicializada`);

            } catch (error) {
                console.error(`❌ Erro ao reconectar sessão ${session.name} (${session.id}):`, error);
                // Remover da lista se houve erro
                this.activeClients.delete(session.id);
            }
        }

        console.log(`🎯 Processo de reconexão finalizado`);
    }

    public getSessions(): Session[] {
        return this.sessions;
    }

    // Recarregar sessões do banco de dados
    public async reloadSessionsFromDatabase(): Promise<Session[]> {
        await this.loadSessionsFromDatabase();
        return this.sessions;
    }

    // Salvar uma sessão no banco de dados
    private async saveSessionToDatabase(sessionData: Session): Promise<void> {
        try {
            const db = DatabaseConfig.getInstance();
            
            if (db.isConnected()) {
                // Verificar se já existe
                const existingSession = await SessionModel.findOne({ sessionId: sessionData.id });
                
                if (existingSession) {
                    // Atualizar sessão existente
                    await SessionModel.updateOne(
                        { sessionId: sessionData.id },
                        { 
                            $set: {
                                userId: sessionData.userId,
                                lastActivity: new Date()
                            }
                        }
                    );
                    console.log(`📝 Sessão '${sessionData.id}' atualizada no banco de dados`);
                } else {
                    // Inserir nova sessão
                    await SessionModel.create({
                        sessionId: sessionData.id,
                        sessionName: sessionData.name, // Salvar o nome personalizado
                        userId: sessionData.userId,
                        ready: false,
                        connected: false,
                        lastActivity: new Date()
                    });
                    console.log(`💾 Sessão '${sessionData.name}' (${sessionData.id}) salva no banco de dados`);
                }
            } else {
                console.warn('⚠️ MongoDB não conectado - sessão não foi salva no banco');
            }
        } catch (error) {
            console.error('❌ Erro ao salvar sessão no banco de dados:', error);
        }
    }

    // Atualizar status da sessão no banco de dados
    private async updateSessionStatus(sessionId: string, status: {
        ready?: boolean;
        connected?: boolean;
        qr?: string | null;
    }): Promise<void> {
        try {
            const db = DatabaseConfig.getInstance();
            
            if (db.isConnected()) {
                const updateData: any = {
                    ...status,
                    lastActivity: new Date()
                };
                
                // Se qr for null, usar $unset para remover o campo
                if (status.qr === null) {
                    await SessionModel.updateOne(
                        { sessionId: sessionId },
                        { 
                            $set: {
                                ready: status.ready,
                                connected: status.connected,
                                lastActivity: new Date()
                            },
                            $unset: { qr: "" }
                        }
                    );
                } else {
                    await SessionModel.updateOne(
                        { sessionId: sessionId },
                        { $set: updateData }
                    );
                }
                
                console.log(`📝 Status da sessão '${sessionId}'`);
            }
        } catch (error) {
            console.error(`❌ Erro ao atualizar status da sessão '${sessionId}':`, error);
        }
    }

    public getActiveClients(): Map<string, Client> {
        return this.activeClients;
    }

    public getQRCodes(): Map<string, string> {
        return this.qrCodes;
    }

    // Buscar QR code do banco de dados se não estiver em memória
    public async getQRCode(sessionId: string): Promise<string | null> {
        // Primeiro, verificar se está em memória
        const qrFromMemory = this.qrCodes.get(sessionId);
        if (qrFromMemory) {
            return qrFromMemory;
        }

        // Se não estiver em memória, buscar no banco
        try {
            const db = DatabaseConfig.getInstance();
            if (db.isConnected()) {
                const session = await SessionModel.findOne({ sessionId }).lean();
                if (session && session.qr) {
                    // Colocar na memória para próximas consultas
                    this.qrCodes.set(sessionId, session.qr);
                    return session.qr;
                }
            }
        } catch (error) {
            console.error(`❌ Erro ao buscar QR code da sessão '${sessionId}':`, error);
        }

        return null;
    }

    public sessionExists(sessionId: string): boolean {
        return this.sessions.some(s => s.id === sessionId);
    }

    public findSession(sessionId: string): Session | undefined {
        return this.sessions.find(s => s.id === sessionId);
    }

    public async createSession(sessionData: Session): Promise<Client> {
        const db = DatabaseConfig.getInstance();
        
        if (!db.isConnected()) {
            throw new Error('MongoDB não está conectado');
        }

        if (this.activeClients.has(sessionData.id)) {
            throw new Error(`Sessão ${sessionData.id} já existe`);
        }

        const client = new Client({
            authStrategy: new RemoteAuth({
                store: db.getStore(),
                backupSyncIntervalMs: this.config.get().backupSyncInterval,
                clientId: sessionData.id
            }),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            }
        });

        this.setupClientEvents(client, sessionData);
        this.activeClients.set(sessionData.id, client);
        this.sessions.push(sessionData);

        // Salvar sessão no MongoDB
        await this.saveSessionToDatabase(sessionData);

        // Inicializar o cliente
        try {
            await client.initialize();
            console.log(`${sessionData.name} (${sessionData.id}) inicializado com sucesso!`);
        } catch (error) {
            console.error(`Erro ao inicializar ${sessionData.name} (${sessionData.id}):`, error);
            this.activeClients.delete(sessionData.id);
            // Remover da lista de sessões também em caso de erro
            const sessionIndex = this.sessions.findIndex(s => s.id === sessionData.id);
            if (sessionIndex > -1) {
                this.sessions.splice(sessionIndex, 1);
            }
            throw error;
        }

        return client;
    }

    // Configurar eventos para reconexão (simplificado)
    private setupReconnectionEvents(client: Client, sessionData: Session): void {
        // Evento QR Code
        client.on('qr', (qr) => {
            console.log(`🔑 ${sessionData.name} (${sessionData.id}) - QR Code gerado`);
            
            qrcode.toDataURL(qr, async (error: Error | null | undefined, url: string) => {
                if (error) {
                    console.error(`❌ Erro ao gerar QR Code para ${sessionData.name}:`, error);
                } else {
                    console.log(`📱 QR Code disponível para ${sessionData.name}`);
                    
                    // Armazenar QR code na memória
                    this.qrCodes.set(sessionData.id, url);
                    
                    // Salvar QR code no banco de dados
                    await this.updateSessionStatus(sessionData.id, { qr: url, ready: false, connected: false });
                }
            });
        });

        // Evento Ready
        client.on('ready', async () => {
            console.log(`🎉 ${sessionData.name} (${sessionData.id}) conectado e pronto!`);
            // Remove QR code quando autenticado
            this.qrCodes.delete(sessionData.id);
            
            // Atualizar status no banco de dados
            await this.updateSessionStatus(sessionData.id, { ready: true, connected: true, qr: null });
        });

        // Evento Authenticated
        client.on('authenticated', async () => {
            console.log(`✅ ${sessionData.name} (${sessionData.id}) autenticado com sucesso!`);
            
            // Atualizar status no banco de dados
            await this.updateSessionStatus(sessionData.id, { connected: true });
        });

        // Evento Auth Failure
        client.on('auth_failure', async (msg) => {
            console.error(`❌ Falha na autenticação para ${sessionData.name} (${sessionData.id}):`, msg);
            
            // Atualizar status no banco de dados
            await this.updateSessionStatus(sessionData.id, { ready: false, connected: false });
            
            // Remover da lista de clientes ativos
            this.activeClients.delete(sessionData.id);
        });

        // Evento Disconnected
        client.on('disconnected', async (reason) => {
            console.log(`🔌 ${sessionData.name} (${sessionData.id}) desconectado:`, reason);
            
            // Remove da lista de clientes ativos
            this.activeClients.delete(sessionData.id);
            this.qrCodes.delete(sessionData.id);
            
            // Atualizar status no banco de dados
            await this.updateSessionStatus(sessionData.id, { ready: false, connected: false });
        });
    }

    private setupClientEvents(client: Client, sessionData: Session): void {
        // Evento QR Code
        client.on('qr', (qr) => {
            console.log(`QR Code gerado para ${sessionData.name} (${sessionData.id})`);
            
            qrcode.toDataURL(qr, async (error: Error | null | undefined, url: string) => {
                if (error) {
                    console.error(`Erro ao gerar QR Code para ${sessionData.name} (${sessionData.id}):`, error);
                } else {
                    console.log(`QR Code Base64 para ${sessionData.name} (${sessionData.id}) gerado`);
                    
                    // Armazenar QR code na memória
                    this.qrCodes.set(sessionData.id, url);
                    
                    // Salvar QR code no banco de dados
                    await this.updateSessionStatus(sessionData.id, { qr: url, ready: false, connected: false });
                }
            });
        });

        // Evento Ready
        client.on('ready', async () => {
            console.log(`${sessionData.name} (${sessionData.id}) está pronto!`);
            // Remove QR code quando autenticado
            this.qrCodes.delete(sessionData.id);
            
            // Atualizar status no banco de dados
            await this.updateSessionStatus(sessionData.id, { ready: true, connected: true });
        });

        // Evento Authenticated
        client.on('authenticated', async () => {
            console.log(`${sessionData.name} (${sessionData.id}) autenticado com sucesso!`);
            
            // Atualizar status no banco de dados
            await this.updateSessionStatus(sessionData.id, { connected: true });
        });

        // Evento Auth Failure
        client.on('auth_failure', async (msg) => {
            console.error(`Falha na autenticação para ${sessionData.name} (${sessionData.id}):`, msg);
            
            // Atualizar status no banco de dados
            await this.updateSessionStatus(sessionData.id, { ready: false, connected: false });
        });

        // Evento Disconnected
        client.on('disconnected', async (reason) => {
            console.log(`${sessionData.name} (${sessionData.id}) desconectado:`, reason);
            // Remove da lista de clientes ativos
            this.activeClients.delete(sessionData.id);
            this.qrCodes.delete(sessionData.id);
            
            // Atualizar status no banco de dados
            await this.updateSessionStatus(sessionData.id, { ready: false, connected: false });
        });
    }

    public async deleteSession(sessionId: string): Promise<boolean> {
        const sessionIndex = this.sessions.findIndex(s => s.id === sessionId);
        if (sessionIndex === -1) {
            return false;
        }

        const session = this.sessions[sessionIndex];
        const db = DatabaseConfig.getInstance();

        try {
            // Remover cliente ativo se existir
            const client = this.activeClients.get(sessionId);
            if (client) {
                await client.destroy();
                this.activeClients.delete(sessionId);
            }

            // Remover QR code
            this.qrCodes.delete(sessionId);

            // Remover da lista de sessões em memória
            this.sessions.splice(sessionIndex, 1);

            // Remover do banco de dados
            if (db.isConnected()) {
                await SessionModel.findOneAndDelete({ sessionId: sessionId });
                console.log(`🗑️ Sessão '${sessionId}' removida do banco de dados`);
            }

            console.log(`✅ Sessão '${sessionId}' deletada completamente`);
            return true;

        } catch (error) {
            console.error(`❌ Erro ao deletar sessão '${sessionId}':`, error);
            throw error;
        }
    }

    public getSessionStatus(sessionId: string): {
        status: 'waiting_qr' | 'connected' | 'disconnected';
        isActive: boolean;
        hasQRCode: boolean;
    } {
        const isActive = this.activeClients.has(sessionId);
        const hasQRCode = this.qrCodes.has(sessionId);

        let status: 'waiting_qr' | 'connected' | 'disconnected' = 'disconnected';
        
        if (hasQRCode) {
            status = 'waiting_qr';
        } else if (isActive) {
            // Verificar se realmente está conectado
            const client = this.activeClients.get(sessionId);
            if (client) {
                // Para sessões ativas sem QR, assumir conectado
                // A verificação real será feita quando necessário
                status = 'connected';
            }
        }

        return { status, isActive, hasQRCode };
    }

    public async sendMessage(sessionId: string, phoneNumber: string, message: string): Promise<any> {
        const client = this.activeClients.get(sessionId);
        
        if (!client) {
            throw new Error(`Sessão '${sessionId}' não está ativa`);
        }

        try {
            // Verificar se o cliente está pronto com timeout
            console.log(`🔍 Verificando estado da sessão '${sessionId}'...`);
            
            // Aguardar um pouco para garantir que o cliente está totalmente carregado
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const state = await Promise.race([
                client.getState(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout ao verificar estado')), 10000)
                )
            ]);
            
            console.log(`📊 Estado da sessão '${sessionId}': ${state}`);
            
            if (state !== 'CONNECTED') {
                throw new Error(`Sessão '${sessionId}' não está conectada. Estado atual: ${state}`);
            }

            // Aguardar mais um pouco para garantir que todos os recursos estão carregados
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Formatar número de telefone (garantir que está no formato correto)
            let formattedNumber = phoneNumber.replace(/\D/g, ''); // Remove tudo que não é dígito
            
            // Se não começar com código do país, assumir Brasil (55)
            if (!formattedNumber.startsWith('55') && formattedNumber.length === 11) {
                formattedNumber = '55' + formattedNumber;
            }
            
            // Adicionar @c.us se não estiver presente
            const chatId = formattedNumber.includes('@') ? formattedNumber : `${formattedNumber}@c.us`;

            console.log(`📤 Enviando mensagem via sessão '${sessionId}' para '${chatId}': ${message.substring(0, 50)}...`);

            // Verificar se o número é válido com timeout e retry
            let isValidNumber = false;
            let retryCount = 0;
            const maxRetries = 3;

            while (!isValidNumber && retryCount < maxRetries) {
                try {
                    console.log(`🔍 Verificando validade do número ${chatId} (tentativa ${retryCount + 1})...`);
                    
                    isValidNumber = await Promise.race([
                        client.isRegisteredUser(chatId),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Timeout ao verificar número')), 15000)
                        )
                    ]) as boolean;
                    
                    if (!isValidNumber) {
                        throw new Error(`Número '${phoneNumber}' não está registrado no WhatsApp`);
                    }
                    
                    break;
                } catch (error: any) {
                    retryCount++;
                    console.warn(`⚠️ Tentativa ${retryCount} falhou ao verificar número:`, error.message);
                    
                    if (retryCount >= maxRetries) {
                        if (error.message.includes('Timeout')) {
                            console.log(`⏰ Timeout na verificação, assumindo que número é válido e tentando enviar...`);
                            isValidNumber = true; // Assumir válido em caso de timeout
                            break;
                        } else {
                            throw error;
                        }
                    }
                    
                    // Aguardar antes de tentar novamente
                    await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
                }
            }

            // Enviar mensagem com timeout e retry
            let sentMessage: any;
            retryCount = 0;

            while (retryCount < maxRetries) {
                try {
                    console.log(`📤 Tentando enviar mensagem (tentativa ${retryCount + 1})...`);
                    
                    sentMessage = await Promise.race([
                        client.sendMessage(chatId, message),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Timeout ao enviar mensagem')), 30000)
                        )
                    ]) as any;
                    
                    break;
                } catch (error: any) {
                    retryCount++;
                    console.error(`❌ Tentativa ${retryCount} falhou:`, error.message);
                    
                    if (retryCount >= maxRetries) {
                        throw error;
                    }
                    
                    // Aguardar mais tempo antes de tentar novamente
                    await new Promise(resolve => setTimeout(resolve, 3000 * retryCount));
                    
                    // Verificar se ainda está conectado
                    const currentState = await client.getState();
                    if (currentState !== 'CONNECTED') {
                        throw new Error(`Sessão desconectou durante o envio. Estado atual: ${currentState}`);
                    }
                }
            }
            
            console.log(`✅ Mensagem enviada com sucesso - ID: ${sentMessage.id._serialized}`);
            
            return {
                id: sentMessage.id._serialized,
                chatId: sentMessage.to,
                message: sentMessage.body,
                timestamp: sentMessage.timestamp,
                ack: sentMessage.ack
            };

        } catch (error: any) {
            console.error(`❌ Erro ao enviar mensagem via sessão '${sessionId}':`, error);
            
            // Verificar se a sessão ainda está ativa após o erro
            try {
                const state = await client.getState();
                console.log(`📊 Estado da sessão após erro: ${state}`);
                
                if (state !== 'CONNECTED') {
                    console.log(`⚠️ Sessão '${sessionId}' não está mais conectada, removendo da lista de ativos`);
                    this.activeClients.delete(sessionId);
                }
            } catch (stateError) {
                console.error(`❌ Erro ao verificar estado após falha:`, stateError);
                // Remover sessão da lista se não conseguir verificar estado
                this.activeClients.delete(sessionId);
            }
            
            throw new Error(`Falha ao enviar mensagem: ${error.message}`);
        }
    }
}

export default WhatsAppService;
