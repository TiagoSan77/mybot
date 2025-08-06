import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

interface Config {
    // Servidor
    port: number;
    nodeEnv: string;
    
    // MongoDB
    mongodbUri: string;
    sessionsCollectionName: string;
    
    // WhatsApp
    backupSyncInterval: number;
    
    // Funcionalidades
    saveQrFiles: boolean;
    logLevel: string;
    
    // Segurança (opcional)
    corsOrigin?: string;
    apiKey?: string;
}

class AppConfig {
    private static instance: AppConfig;
    private config: Config;

    private constructor() {
        this.config = this.loadConfig();
        this.validateConfig();
    }

    public static getInstance(): AppConfig {
        if (!AppConfig.instance) {
            AppConfig.instance = new AppConfig();
        }
        return AppConfig.instance;
    }

    private loadConfig(): Config {
        const config: Config = {
            // Servidor
            port: parseInt(process.env.PORT || '3000'),
            nodeEnv: process.env.NODE_ENV || 'development',
            
            // MongoDB
            mongodbUri: process.env.MONGODB_URI || '',
            sessionsCollectionName: process.env.SESSIONS_COLLECTION_NAME || 'whatsappSessions',
            
            // WhatsApp
            backupSyncInterval: parseInt(process.env.BACKUP_SYNC_INTERVAL || '300000'),
            
            // Funcionalidades
            saveQrFiles: process.env.SAVE_QR_FILES === 'true',
            logLevel: process.env.LOG_LEVEL || 'info',
        };

        // Adicionar propriedades opcionais apenas se definidas
        if (process.env.CORS_ORIGIN) {
            config.corsOrigin = process.env.CORS_ORIGIN;
        }
        
        if (process.env.API_KEY) {
            config.apiKey = process.env.API_KEY;
        }

        return config;
    }

    private validateConfig(): void {
        const requiredVars = ['mongodbUri'];
        const missing = requiredVars.filter(key => !this.config[key as keyof Config]);
        
        if (missing.length > 0) {
            throw new Error(`Variáveis de ambiente obrigatórias não definidas: ${missing.join(', ')}`);
        }

        // Validações específicas
        if (this.config.port < 1 || this.config.port > 65535) {
            throw new Error('PORT deve estar entre 1 e 65535');
        }

        if (this.config.backupSyncInterval < 60000) {
            throw new Error('BACKUP_SYNC_INTERVAL deve ser pelo menos 60000ms (1 minuto)');
        }
    }

    public get(): Config {
        return this.config;
    }

    public isDevelopment(): boolean {
        return this.config.nodeEnv === 'development';
    }

    public isProduction(): boolean {
        return this.config.nodeEnv === 'production';
    }

    public printConfig(): void {
        console.log('\n🔧 Configurações da Aplicação:');
        console.log('================================');
        console.log(`🚀 Porta: ${this.config.port}`);
        console.log(`🌍 Ambiente: ${this.config.nodeEnv}`);
        console.log(`📦 Collection: ${this.config.sessionsCollectionName}`);
        console.log(`⏱️  Sync Interval: ${this.config.backupSyncInterval}ms`);
        console.log(`💾 Salvar QR Files: ${this.config.saveQrFiles ? 'Sim' : 'Não'}`);
        console.log(`📋 Log Level: ${this.config.logLevel}`);
        if (this.config.corsOrigin) {
            console.log(`🔒 CORS Origin: ${this.config.corsOrigin}`);
        }
        console.log('================================\n');
    }
}

export default AppConfig;
