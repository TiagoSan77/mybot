import { Router } from 'express';
import messageTemplateController from '../controllers/messageTemplateController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// Rotas para templates de mensagem
router.post('/', messageTemplateController.createTemplate);           // Criar template
router.get('/', messageTemplateController.getTemplates);              // Listar templates
router.get('/categories', messageTemplateController.getCategories);   // Obter categorias
router.get('/:templateId', messageTemplateController.getTemplate);    // Obter template específico
router.put('/:templateId', messageTemplateController.updateTemplate); // Atualizar template
router.delete('/:templateId', messageTemplateController.deleteTemplate); // Deletar template
router.post('/:templateId/use', messageTemplateController.incrementUsage); // Registrar uso

export default router;
