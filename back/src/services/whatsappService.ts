import { Client, RemoteAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode';
import fs from 'fs';
import { Session } from '../types/session';
import DatabaseConfig from '../config/database';
import AppConfig from '../config/app';

class WhatsAppService {
    private static instance: WhatsAppService;
    private sessions: Session[] = [];
    private activeClients = new Map<string, Client>();
    private qrCodes = new Map<string, string>();
    private config: AppConfig;

    private constructor() {
        this.config = AppConfig.getInstance();
    }

    public static getInstance(): WhatsAppService {
        if (!WhatsAppService.instance) {
            WhatsAppService.instance = new WhatsAppService();
        }
        return WhatsAppService.instance;
    }

    public getSessions(): Session[] {
        return this.sessions;
    }

    public getActiveClients(): Map<string, Client> {
        return this.activeClients;
    }

    public getQRCodes(): Map<string, string> {
        return this.qrCodes;
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
            })
        });

        this.setupClientEvents(client, sessionData);
        this.activeClients.set(sessionData.id, client);
        this.sessions.push(sessionData);

        // Inicializar o cliente
        try {
            await client.initialize();
            console.log(`${sessionData.name} (${sessionData.id}) inicializado com sucesso!`);
        } catch (error) {
            console.error(`Erro ao inicializar ${sessionData.name} (${sessionData.id}):`, error);
            this.activeClients.delete(sessionData.id);
            throw error;
        }

        return client;
    }

    private setupClientEvents(client: Client, sessionData: Session): void {
        // Evento QR Code
        client.on('qr', (qr) => {
            console.log(`QR Code gerado para ${sessionData.name} (${sessionData.id})`);
            
            qrcode.toDataURL(qr, (error: Error | null | undefined, url: string) => {
                if (error) {
                    console.error(`Erro ao gerar QR Code para ${sessionData.name} (${sessionData.id}):`, error);
                } else {
                    console.log(`QR Code Base64 para ${sessionData.name} (${sessionData.id}) gerado`);
                    
                    // Armazenar QR code na memória
                    this.qrCodes.set(sessionData.id, url);
                    
                    // Salvar em arquivo (se configurado)
                    if (this.config.get().saveQrFiles) {
                        fs.writeFileSync(`qr-${sessionData.id}.txt`, url);
                        console.log(`QR Code salvo em qr-${sessionData.id}.txt`);
                    }
                }
            });
        });

        // Evento Ready
        client.on('ready', () => {
            console.log(`${sessionData.name} (${sessionData.id}) está pronto!`);
            // Remove QR code quando autenticado
            this.qrCodes.delete(sessionData.id);
        });

        // Evento Authenticated
        client.on('authenticated', () => {
            console.log(`${sessionData.name} (${sessionData.id}) autenticado com sucesso!`);
        });

        // Evento Auth Failure
        client.on('auth_failure', (msg) => {
            console.error(`Falha na autenticação para ${sessionData.name} (${sessionData.id}):`, msg);
        });

        // Evento Disconnected
        client.on('disconnected', (reason) => {
            console.log(`${sessionData.name} (${sessionData.id}) desconectado:`, reason);
            // Remove da lista de clientes ativos
            this.activeClients.delete(sessionData.id);
            this.qrCodes.delete(sessionData.id);
        });
    }

    public async deleteSession(sessionId: string): Promise<boolean> {
        const sessionIndex = this.sessions.findIndex(s => s.id === sessionId);
        if (sessionIndex === -1) {
            return false;
        }

        // Remover cliente ativo se existir
        const client = this.activeClients.get(sessionId);
        if (client) {
            await client.destroy();
            this.activeClients.delete(sessionId);
        }

        // Remover QR code
        this.qrCodes.delete(sessionId);

        // Remover da lista de sessões
        this.sessions.splice(sessionIndex, 1);

        return true;
    }

    public getSessionStatus(sessionId: string): {
        status: 'waiting_qr' | 'connected' | 'disconnected';
        isActive: boolean;
        hasQRCode: boolean;
    } {
        const isActive = this.activeClients.has(sessionId);
        const hasQRCode = this.qrCodes.has(sessionId);

        let status: 'waiting_qr' | 'connected' | 'disconnected' = 'disconnected';
        if (hasQRCode) status = 'waiting_qr';
        if (isActive && !hasQRCode) status = 'connected';

        return { status, isActive, hasQRCode };
    }
}

export default WhatsAppService;
