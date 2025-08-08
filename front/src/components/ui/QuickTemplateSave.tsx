import { useState } from 'react';
import { Save, BookOpen } from 'lucide-react';
import whatsappAPI from '../../services/api';
import type { CreateTemplateRequest } from '../../types/api';

interface QuickTemplateSaveProps {
  message: string;
  onTemplateSaved?: () => void;
  className?: string;
}

export default function QuickTemplateSave({ message, onTemplateSaved, className = '' }: QuickTemplateSaveProps) {
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [templateData, setTemplateData] = useState({
    name: '',
    category: 'Geral'
  });

  const handleSave = async () => {
    if (!templateData.name.trim()) {
      alert('Digite um nome para o template!');
      return;
    }

    if (!message.trim()) {
      alert('Não há mensagem para salvar!');
      return;
    }

    try {
      setSaving(true);
      
      const templateRequest: CreateTemplateRequest = {
        name: templateData.name.trim(),
        content: message.trim(),
        category: templateData.category,
        tags: []
      };

      await whatsappAPI.createTemplate(templateRequest);
      
      // Resetar e fechar
      setTemplateData({ name: '', category: 'Geral' });
      setShowModal(false);
      
      // Callback de sucesso
      if (onTemplateSaved) {
        onTemplateSaved();
      }
      
      alert('Template salvo com sucesso!');
      
    } catch (error: any) {
      console.error('Erro ao salvar template:', error);
      alert('Erro ao salvar template: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const categorias = [
    'Geral',
    'Saudações', 
    'Despedidas',
    'Informações',
    'Atendimento',
    'Promoções',
    'Agradecimentos',
    'Confirmações'
  ];

  return (
    <>
      {/* Botão para salvar template */}
      <button
        onClick={() => setShowModal(true)}
        disabled={!message.trim()}
        className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
        title="Salvar como template"
      >
        <Save className="w-4 h-4" />
        <span className="hidden sm:inline">Template</span>
      </button>

      {/* Modal de salvamento */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Salvar como Template</h3>
            </div>

            {/* Preview da mensagem */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem que será salva:
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {message}
                </p>
                <div className="text-xs text-gray-500 mt-2">
                  {message.length} caracteres
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Template *
                </label>
                <input
                  type="text"
                  value={templateData.name}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Bom dia cliente, Agradecimento, Confirmação pedido..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={templateData.category}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {categorias.map(categoria => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!templateData.name.trim() || saving}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar Template
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
