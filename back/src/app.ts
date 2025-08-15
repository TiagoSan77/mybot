import express from 'express';
import cors from 'cors';
import routes from './routes';
import DatabaseConfig from './config/database';
import AppConfig from './config/app';
import { SchedulerService } from './services/schedulerService';
import subscriptionService from './services/subscriptionService';
import * as cron from 'node-cron';

class App {
    public app: express.Application;
    private config: AppConfig;

    constructor() {
        this.config = AppConfig.getInstance();
        this.app = express();
        
        this.initializeMiddlewares();
        this.initializeRoutes();
    }

    private initializeMiddlewares(): void {
        const appConfig = this.config.get();
        
        this.app.use(express.json());
        
        // Configurar CORS
        if (appConfig.corsOrigin) {
            this.app.use(cors({
                origin: appConfig.corsOrigin,
                credentials: true
            }));
        } else {
            this.app.use(cors());
        }

        // Middleware de log (se necessário)
        if (this.config.isDevelopment()) {
            this.app.use((req, res, next) => {
                console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
                next();
            });
        }
    }

    private initializeRoutes(): void {
        this.app.use('/api', routes);
    }

    public async start(): Promise<void> {
        try {
            const appConfig = this.config.get();

            // Exibir configurações
            this.config.printConfig();

            // Conectar ao banco de dados
            const db = DatabaseConfig.getInstance();
            await db.connect();

            // Inicializar planos de pagamento
            console.log('💳 Inicializando planos de pagamento...');
            await subscriptionService.initializePlans();

            // Inicializar serviço de agendamento de mensagens
            console.log('📅 Inicializando serviço de agendamento...');
            SchedulerService.getInstance();

            // Agendar verificação de assinaturas expiradas (diariamente às 6h)
            cron.schedule('0 6 * * *', async () => {
                console.log('🔍 Verificando assinaturas expiradas...');
                const expiredCount = await subscriptionService.checkExpiredSubscriptions();
                console.log(`📊 ${expiredCount} assinatura(s) expirada(s) processada(s)`);
            });

            // Iniciar servidor
            this.app.listen(appConfig.port, () => {
                console.log(`🚀 Servidor rodando na porta ${appConfig.port}`);
                console.log(`📱 API de Sessões WhatsApp disponível em http://localhost:${appConfig.port}`);
                console.log(`🌍 Ambiente: ${appConfig.nodeEnv}`);
            });

        } catch (error) {
            console.error('❌ Erro ao iniciar aplicação:', error);
            process.exit(1);
        }
    }
}

export default App;
