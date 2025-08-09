import mongoose from 'mongoose';
import { MongoStore } from 'wwebjs-mongo';
import AppConfig from './app';

class DatabaseConfig {
    private static instance: DatabaseConfig;
    private mongoStore: any = null;
    private config: AppConfig;

    private constructor() {
        this.config = AppConfig.getInstance();
    }

    public static getInstance(): DatabaseConfig {
        if (!DatabaseConfig.instance) {
            DatabaseConfig.instance = new DatabaseConfig();
        }
        return DatabaseConfig.instance;
    }

    public async connect(): Promise<void> {
        try {
            const appConfig = this.config.get();
            
            await mongoose.connect(appConfig.mongodbUri);
            this.mongoStore = new MongoStore({ 
                mongoose: mongoose,
                collectionName: 'whatsappAuth' // Collection separada para dados de autenticação
            });
            console.log('✅ MongoDB conectado com sucesso!');
            console.log(`📦 Collection: ${appConfig.sessionsCollectionName}`);
            console.log(`🔐 Auth Collection: whatsappAuth`);
        } catch (error) {
            console.error('❌ Erro ao conectar com MongoDB:', error);
            throw error;
        }
    }

    public getStore(): any {
        if (!this.mongoStore) {
            throw new Error('MongoDB não está conectado. Chame connect() primeiro.');
        }
        return this.mongoStore;
    }

    public isConnected(): boolean {
        return this.mongoStore !== null;
    }
}

export default DatabaseConfig;
