import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { Session } from '../types/api';

interface Template {
  templateId: string;
  name: string;
  content: string;
  category?: string;
}

interface ScheduledMessage {
  messageId: string;
  recipientNumber: string;
  recipientName?: string;
  templateId?: string;
  messageContent: string;
  scheduledDate: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  createdAt: string;
  sentAt?: string;
  errorMessage?: string;
  attempts: number;
}

const MessageScheduler: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'list'>('schedule');

  // Formulário de agendamento
  const [formData, setFormData] = useState({
    sessionId: '',
    recipientNumber: '',
    recipientName: '',
    templateId: '',
    messageContent: '',
    scheduledDate: '',
    scheduledTime: ''
  });

  // Estados do componente
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadTemplates(),
        loadSessions(),
        loadScheduledMessages()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await api.getSchedulerTemplates();
      if (response.success) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await api.getSessions();
      if (response.sessions) {
        setSessions(response.sessions);
      }
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
    }
  };

  const loadScheduledMessages = async () => {
    try {
      const params = filterStatus ? { status: filterStatus } : {};
      const response = await api.getScheduledMessages(params);
      if (response.success) {
        setScheduledMessages(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens agendadas:', error);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.templateId === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        templateId,
        messageContent: template.content
      }));
      setSelectedTemplate(template);
    } else {
      setFormData(prev => ({
        ...prev,
        templateId: '',
        messageContent: ''
      }));
      setSelectedTemplate(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sessionId || !formData.recipientNumber || !formData.scheduledDate || !formData.scheduledTime) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (!formData.templateId && !formData.messageContent.trim()) {
      alert('Selecione um template ou digite uma mensagem');
      return;
    }

    try {
      setLoading(true);
      
      // Combinar data e hora
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      
      if (scheduledDateTime <= new Date()) {
        alert('A data e hora devem ser futuras');
        return;
      }

      const payload = {
        sessionId: formData.sessionId,
        recipientNumber: formData.recipientNumber,
        recipientName: formData.recipientName || undefined,
        templateId: formData.templateId || undefined,
        messageContent: formData.templateId ? undefined : formData.messageContent,
        scheduledDate: scheduledDateTime.toISOString()
      };

      const response = await api.scheduleMessage(payload);
      
      if (response.success) {
        alert('Mensagem agendada com sucesso!');
        setFormData({
          sessionId: '',
          recipientNumber: '',
          recipientName: '',
          templateId: '',
          messageContent: '',
          scheduledDate: '',
          scheduledTime: ''
        });
        setSelectedTemplate(null);
        await loadScheduledMessages();
      }
    } catch (error: any) {
      console.error('Erro ao agendar mensagem:', error);
      alert(error.response?.data?.message || 'Erro ao agendar mensagem');
    } finally {
      setLoading(false);
    }
  };

  const cancelScheduledMessage = async (messageId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta mensagem agendada?')) {
      return;
    }

    try {
      const response = await api.cancelScheduledMessage(messageId);
      if (response.success) {
        alert('Mensagem cancelada com sucesso!');
        await loadScheduledMessages();
      }
    } catch (error: any) {
      console.error('Erro ao cancelar mensagem:', error);
      alert(error.response?.data?.message || 'Erro ao cancelar mensagem');
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      pending: 'Pendente',
      sent: 'Enviada',
      failed: 'Falhou',
      cancelled: 'Cancelada'
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  // Definir data mínima (hoje)
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const minTime = formData.scheduledDate === today ? 
    `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes() + 1).padStart(2, '0')}` : 
    '00:00';

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">📅 Agendador de Mensagens</h2>
        <p className="text-sm sm:text-base text-gray-600">Agende mensagens para serem enviadas automaticamente</p>
      </div>

      {/* Abas */}
      <div className="flex border-b mb-4 sm:mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-3 sm:px-4 py-2 font-medium text-sm sm:text-base whitespace-nowrap ${
            activeTab === 'schedule'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="hidden sm:inline">Nova Mensagem</span>
          <span className="sm:hidden">Nova</span>
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`px-3 sm:px-4 py-2 font-medium text-sm sm:text-base whitespace-nowrap ${
            activeTab === 'list'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="hidden sm:inline">Mensagens Agendadas</span>
          <span className="sm:hidden">Agendadas</span>
        </button>
      </div>

      {/* Formulário de Agendamento */}
      {activeTab === 'schedule' && (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Sessão */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sessão WhatsApp *
              </label>
              <select
                value={formData.sessionId}
                onChange={(e) => setFormData(prev => ({ ...prev, sessionId: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              >
                <option value="">Selecione uma sessão</option>
                {sessions.filter(s => s.isActive).map(session => (
                  <option key={session.id} value={session.id}>
                    {session.name} ({session.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Número do destinatário */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número do Destinatário *
              </label>
              <input
                type="text"
                value={formData.recipientNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, recipientNumber: e.target.value }))}
                placeholder="Ex: 5511999999999"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>

            {/* Nome do destinatário */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Destinatário
              </label>
              <input
                type="text"
                value={formData.recipientName}
                onChange={(e) => setFormData(prev => ({ ...prev, recipientName: e.target.value }))}
                placeholder="Nome (opcional)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            {/* Template */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template de Mensagem
              </label>
              <select
                value={formData.templateId}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="">Selecione um template (opcional)</option>
                {templates.map(template => (
                  <option key={template.templateId} value={template.templateId}>
                    {template.name} - {template.category}
                  </option>
                ))}
              </select>
            </div>

            {/* Data */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Envio *
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                min={today}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>

            {/* Hora */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de Envio *
              </label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                min={minTime}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>
          </div>

          {/* Conteúdo da mensagem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conteúdo da Mensagem {!formData.templateId && '*'}
            </label>
            <textarea
              value={formData.messageContent}
              onChange={(e) => setFormData(prev => ({ ...prev, messageContent: e.target.value }))}
              placeholder="Digite sua mensagem aqui ou selecione um template acima"
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-y"
              required={!formData.templateId}
              disabled={!!formData.templateId}
            />
            {selectedTemplate && (
              <p className="text-sm text-blue-600 mt-1">
                Template selecionado: {selectedTemplate.name}
              </p>
            )}
          </div>

          {/* Botão de envio */}
          <div className="flex justify-center sm:justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? 'Agendando...' : '📅 Agendar Mensagem'}
            </button>
          </div>
        </form>
      )}

      {/* Lista de Mensagens Agendadas */}
      {activeTab === 'list' && (
        <div>
          {/* Filtros */}
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="sent">Enviada</option>
              <option value="failed">Falhou</option>
              <option value="cancelled">Cancelada</option>
            </select>
            <button
              onClick={loadScheduledMessages}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              🔄 Atualizar
            </button>
          </div>

          {/* Tabela responsiva */}
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                {/* Desktop Table */}
                <table className="min-w-full divide-y divide-gray-300 hidden md:table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Destinatário
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mensagem
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Agendado para
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scheduledMessages.map((message) => (
                      <tr key={message.messageId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">{message.recipientName || 'Sem nome'}</div>
                            <div className="text-sm text-gray-500">{message.recipientNumber}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs truncate text-sm text-gray-900" title={message.messageContent}>
                            {message.messageContent}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(message.scheduledDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(message.status)}
                          {message.errorMessage && (
                            <div className="text-xs text-red-600 mt-1" title={message.errorMessage}>
                              Erro: {message.errorMessage.substring(0, 50)}...
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {message.status === 'pending' && (
                            <button
                              onClick={() => cancelScheduledMessage(message.messageId)}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                            >
                              Cancelar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile Cards */}
                <div className="md:hidden">
                  {scheduledMessages.map((message) => (
                    <div key={message.messageId} className="bg-white border-b border-gray-200 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{message.recipientName || 'Sem nome'}</h3>
                          <p className="text-sm text-gray-500">{message.recipientNumber}</p>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          {getStatusBadge(message.status)}
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <p className="text-sm text-gray-900 overflow-hidden" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical'
                        }}>{message.messageContent}</p>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-xs text-gray-500">
                          Agendado para: {formatDateTime(message.scheduledDate)}
                        </p>
                      </div>
                      
                      {message.errorMessage && (
                        <div className="mb-3 p-2 bg-red-50 rounded">
                          <p className="text-xs text-red-600">{message.errorMessage}</p>
                        </div>
                      )}
                      
                      {message.status === 'pending' && (
                        <div className="flex justify-end">
                          <button
                            onClick={() => cancelScheduledMessage(message.messageId)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {scheduledMessages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm sm:text-base">Nenhuma mensagem agendada encontrada</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageScheduler;
