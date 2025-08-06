import App from './app';

// Inicializar aplicação
const app = new App();
app.start().catch((error) => {
    console.error('Falha ao iniciar a aplicação:', error);
    process.exit(1);
});