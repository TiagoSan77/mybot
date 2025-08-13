import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import whatsappAPI from '../../services/api';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionCreated: () => void;
}

export default function CreateSessionModal({ isOpen, onClose, onSessionCreated }: CreateSessionModalProps) {
  const [formData, setFormData] = useState({
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Nome da sessão é obrigatório');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await whatsappAPI.createSession(formData);
      setFormData({ name: '' });
      onSessionCreated();
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao criar sessão');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (error) setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
          <h2 className="text-lg sm:text-xl font-semibold">Nova Sessão WhatsApp</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Sessão
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: WhatsApp Pessoal, Cliente João Silva"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              O ID da sessão será gerado automaticamente
            </p>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Criando...</span>
                  <span className="sm:hidden">Criando</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Criar Sessão</span>
                  <span className="sm:hidden">Criar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
