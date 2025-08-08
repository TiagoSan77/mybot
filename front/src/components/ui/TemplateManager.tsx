import { useState, useEffect } from 'react';
import { Plus, Save, BookOpen, Search, Tag, Copy } from 'lucide-react';
import whatsappAPI from '../../services/api';
import type { MessageTemplate, CreateTemplateRequest } from '../../types/api';

interface TemplateManagerProps {
  onSelectTemplate?: (template: MessageTemplate) => void;
  showCompact?: boolean;
}

export default function TemplateManager({ onSelectTemplate, showCompact = false }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory] = useState('all');

  // Estados para criação rápida
  const [quickTemplate, setQuickTemplate] = useState({
    name: '',
    content: '',
    category: 'Geral'
  });

  useEffect(() => {
    loadTemplates();
    loadCategories();
  }, [selectedCategory, searchTerm]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;
      params.active = true;

      const response = await whatsappAPI.getTemplates(params);
      setTemplates(response.data.templates);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await whatsappAPI.getTemplateCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handleCreateTemplate = async () => {
    if (!quickTemplate.name.trim() || !quickTemplate.content.trim()) {
      alert('Nome e conteúdo são obrigatórios!');
      return;
    }

    try {
      const templateData: CreateTemplateRequest = {
        name: quickTemplate.name.trim(),
        content: quickTemplate.content.trim(),
        category: quickTemplate.category,
        tags: []
      };

      await whatsappAPI.createTemplate(templateData);
      
      // Resetar formulário
      setQuickTemplate({ name: '', content: '', category: 'Geral' });
      setShowCreateModal(false);
      
      // Recarregar templates
      loadTemplates();
      
      alert('Template criado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao criar template:', error);
      alert('Erro ao criar template: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUseTemplate = async (template: MessageTemplate) => {
    try {
      // Registrar uso
      await whatsappAPI.incrementTemplateUsage(template.templateId);
      
      // Chamar callback se fornecido
      if (onSelectTemplate) {
        onSelectTemplate(template);
      }
      
      // Recarregar para atualizar contador de uso
      loadTemplates();
    } catch (error) {
      console.error('Erro ao usar template:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Texto copiado para a área de transferência!');
  };

  if (showCompact) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Templates</h3>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo
          </button>
        </div>

        {/* Busca rápida */}
        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Lista compacta de templates */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Carregando...</div>
          ) : templates.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              {searchTerm ? 'Nenhum template encontrado' : 'Nenhum template criado ainda'}
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.templateId}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900 truncate">
                      {template.name}
                    </span>
                    {template.category && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                        <Tag className="w-3 h-3" />
                        {template.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 truncate">
                    {template.content}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      Usado {template.usageCount}x
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => copyToClipboard(template.content)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copiar"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    Usar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal de criação rápida */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Criar Template</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Template
                  </label>
                  <input
                    type="text"
                    value={quickTemplate.name}
                    onChange={(e) => setQuickTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Bom dia, Agradecimento..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={quickTemplate.category}
                    onChange={(e) => setQuickTemplate(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Geral">Geral</option>
                    <option value="Saudações">Saudações</option>
                    <option value="Despedidas">Despedidas</option>
                    <option value="Informações">Informações</option>
                    <option value="Atendimento">Atendimento</option>
                    <option value="Promoções">Promoções</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conteúdo da Mensagem
                  </label>
                  <textarea
                    value={quickTemplate.content}
                    onChange={(e) => setQuickTemplate(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Digite a mensagem que será salva como template..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {quickTemplate.content.length} caracteres
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateTemplate}
                  disabled={!quickTemplate.name.trim() || !quickTemplate.content.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Versão completa (não implementada neste exemplo)
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Gerenciar Templates</h2>
      {/* Implementar versão completa conforme necessário */}
    </div>
  );
}
