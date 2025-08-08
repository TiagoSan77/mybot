import { Request, Response } from 'express';
import { MessageTemplate, IMessageTemplate } from '../models/MessageTemplate';
import { v4 as uuidv4 } from 'uuid';

export class MessageTemplateController {
    // Criar novo template
    async createTemplate(req: Request, res: Response): Promise<void> {
        try {
            const { name, content, category, tags } = req.body;
            const userId = req.user?.uid;

            if (!userId) {
                res.status(401).json({ 
                    success: false, 
                    message: 'Usuário não autenticado' 
                });
                return;
            }

            if (!name || !content) {
                res.status(400).json({ 
                    success: false, 
                    message: 'Nome e conteúdo são obrigatórios' 
                });
                return;
            }

            const templateId = uuidv4();

            const template = await MessageTemplate.create({
                templateId,
                name: name.trim(),
                content: content.trim(),
                category: category?.trim() || 'Geral',
                tags: tags || [],
                userId,
                isActive: true,
                usageCount: 0
            });

            console.log(`📝 Template '${name}' criado para usuário ${userId}`);

            res.status(201).json({
                success: true,
                message: 'Template criado com sucesso',
                data: {
                    templateId: template.templateId,
                    name: template.name,
                    content: template.content,
                    category: template.category,
                    tags: template.tags,
                    isActive: template.isActive,
                    usageCount: template.usageCount,
                    createdAt: template.createdAt
                }
            });

        } catch (error: any) {
            console.error('❌ Erro ao criar template:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }

    // Listar templates do usuário
    async getTemplates(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.uid;
            const { category, active, search } = req.query;

            if (!userId) {
                res.status(401).json({ 
                    success: false, 
                    message: 'Usuário não autenticado' 
                });
                return;
            }

            // Construir filtros
            const filters: any = { userId };

            if (category && category !== 'all') {
                filters.category = category;
            }

            if (active !== undefined) {
                filters.isActive = active === 'true';
            }

            // Busca por texto
            if (search) {
                filters.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { content: { $regex: search, $options: 'i' } },
                    { tags: { $in: [new RegExp(search as string, 'i')] } }
                ];
            }

            const templates = await MessageTemplate.find(filters)
                .sort({ usageCount: -1, updatedAt: -1 })
                .lean();

            // Agrupar por categoria para melhor organização
            const categorizedTemplates = templates.reduce((acc: any, template) => {
                const cat = template.category || 'Geral';
                if (!acc[cat]) {
                    acc[cat] = [];
                }
                acc[cat].push({
                    templateId: template.templateId,
                    name: template.name,
                    content: template.content,
                    category: template.category,
                    tags: template.tags,
                    isActive: template.isActive,
                    usageCount: template.usageCount,
                    createdAt: template.createdAt,
                    updatedAt: template.updatedAt
                });
                return acc;
            }, {});

            res.json({
                success: true,
                message: 'Templates recuperados com sucesso',
                data: {
                    templates: templates.map(template => ({
                        templateId: template.templateId,
                        name: template.name,
                        content: template.content,
                        category: template.category,
                        tags: template.tags,
                        isActive: template.isActive,
                        usageCount: template.usageCount,
                        createdAt: template.createdAt,
                        updatedAt: template.updatedAt
                    })),
                    categorized: categorizedTemplates,
                    total: templates.length
                }
            });

        } catch (error: any) {
            console.error('❌ Erro ao buscar templates:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }

    // Obter template específico
    async getTemplate(req: Request, res: Response): Promise<void> {
        try {
            const { templateId } = req.params;
            const userId = req.user?.uid;

            if (!userId) {
                res.status(401).json({ 
                    success: false, 
                    message: 'Usuário não autenticado' 
                });
                return;
            }

            const template = await MessageTemplate.findOne({ 
                templateId, 
                userId 
            }).lean();

            if (!template) {
                res.status(404).json({ 
                    success: false, 
                    message: 'Template não encontrado' 
                });
                return;
            }

            res.json({
                success: true,
                message: 'Template encontrado',
                data: {
                    templateId: template.templateId,
                    name: template.name,
                    content: template.content,
                    category: template.category,
                    tags: template.tags,
                    isActive: template.isActive,
                    usageCount: template.usageCount,
                    createdAt: template.createdAt,
                    updatedAt: template.updatedAt
                }
            });

        } catch (error: any) {
            console.error('❌ Erro ao buscar template:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }

    // Atualizar template
    async updateTemplate(req: Request, res: Response): Promise<void> {
        try {
            const { templateId } = req.params;
            const { name, content, category, tags, isActive } = req.body;
            const userId = req.user?.uid;

            if (!userId) {
                res.status(401).json({ 
                    success: false, 
                    message: 'Usuário não autenticado' 
                });
                return;
            }

            const updateData: any = {};
            
            if (name !== undefined) updateData.name = name.trim();
            if (content !== undefined) updateData.content = content.trim();
            if (category !== undefined) updateData.category = category.trim();
            if (tags !== undefined) updateData.tags = tags;
            if (isActive !== undefined) updateData.isActive = isActive;

            const template = await MessageTemplate.findOneAndUpdate(
                { templateId, userId },
                { $set: updateData },
                { new: true, lean: true }
            );

            if (!template) {
                res.status(404).json({ 
                    success: false, 
                    message: 'Template não encontrado' 
                });
                return;
            }

            console.log(`📝 Template '${templateId}' atualizado para usuário ${userId}`);

            res.json({
                success: true,
                message: 'Template atualizado com sucesso',
                data: {
                    templateId: template.templateId,
                    name: template.name,
                    content: template.content,
                    category: template.category,
                    tags: template.tags,
                    isActive: template.isActive,
                    usageCount: template.usageCount,
                    createdAt: template.createdAt,
                    updatedAt: template.updatedAt
                }
            });

        } catch (error: any) {
            console.error('❌ Erro ao atualizar template:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }

    // Deletar template
    async deleteTemplate(req: Request, res: Response): Promise<void> {
        try {
            const { templateId } = req.params;
            const userId = req.user?.uid;

            if (!userId) {
                res.status(401).json({ 
                    success: false, 
                    message: 'Usuário não autenticado' 
                });
                return;
            }

            const template = await MessageTemplate.findOneAndDelete({ 
                templateId, 
                userId 
            });

            if (!template) {
                res.status(404).json({ 
                    success: false, 
                    message: 'Template não encontrado' 
                });
                return;
            }

            console.log(`🗑️ Template '${templateId}' deletado para usuário ${userId}`);

            res.json({
                success: true,
                message: 'Template deletado com sucesso'
            });

        } catch (error: any) {
            console.error('❌ Erro ao deletar template:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }

    // Incrementar contador de uso
    async incrementUsage(req: Request, res: Response): Promise<void> {
        try {
            const { templateId } = req.params;
            const userId = req.user?.uid;

            if (!userId) {
                res.status(401).json({ 
                    success: false, 
                    message: 'Usuário não autenticado' 
                });
                return;
            }

            const template = await MessageTemplate.findOneAndUpdate(
                { templateId, userId },
                { $inc: { usageCount: 1 } },
                { new: true, lean: true }
            );

            if (!template) {
                res.status(404).json({ 
                    success: false, 
                    message: 'Template não encontrado' 
                });
                return;
            }

            res.json({
                success: true,
                message: 'Uso do template registrado',
                data: {
                    templateId: template.templateId,
                    usageCount: template.usageCount
                }
            });

        } catch (error: any) {
            console.error('❌ Erro ao incrementar uso do template:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }

    // Obter categorias do usuário
    async getCategories(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.uid;

            if (!userId) {
                res.status(401).json({ 
                    success: false, 
                    message: 'Usuário não autenticado' 
                });
                return;
            }

            const categories = await MessageTemplate.distinct('category', { 
                userId, 
                isActive: true 
            });

            res.json({
                success: true,
                message: 'Categorias recuperadas com sucesso',
                data: {
                    categories: categories.filter(cat => cat) // Remove valores null/undefined
                }
            });

        } catch (error: any) {
            console.error('❌ Erro ao buscar categorias:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
}

export default new MessageTemplateController();
