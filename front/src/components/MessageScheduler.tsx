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
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">📅 Agendador de Mensagens</h2>
        <p className="text-gray-600">Agende mensagens para serem enviadas automaticamente</p>
      </div>

      {/* Abas */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'schedule'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Nova Mensagem
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'list'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Mensagens Agendadas
        </button>
      </div>

      {/* Formulário de Agendamento */}
      {activeTab === 'schedule' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sessão */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sessão WhatsApp *
              </label>
              <select
                value={formData.sessionId}
                onChange={(e) => setFormData(prev => ({ ...prev, sessionId: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número do Destinatário *
              </label>
              <input
                type="text"
                value={formData.recipientNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, recipientNumber: e.target.value }))}
                placeholder="Ex: 5511999999999"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Nome do destinatário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Destinatário
              </label>
              <input
                type="text"
                value={formData.recipientName}
                onChange={(e) => setFormData(prev => ({ ...prev, recipientName: e.target.value }))}
                placeholder="Nome (opcional)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Template */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template de Mensagem
              </label>
              <select
                value={formData.templateId}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Envio *
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                min={today}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Hora */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de Envio *
              </label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                min={minTime}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="mb-4 flex justify-between items-center">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg"
            >
              <option value="">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="sent">Enviada</option>
              <option value="failed">Falhou</option>
              <option value="cancelled">Cancelada</option>
            </select>
            <button
              onClick={loadScheduledMessages}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              🔄 Atualizar
            </button>
          </div>

          {/* Tabela de mensagens */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-3 text-left">Destinatário</th>
                  <th className="border border-gray-300 p-3 text-left">Mensagem</th>
                  <th className="border border-gray-300 p-3 text-left">Agendado para</th>
                  <th className="border border-gray-300 p-3 text-left">Status</th>
                  <th className="border border-gray-300 p-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {scheduledMessages.map((message) => (
                  <tr key={message.messageId} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3">
                      <div>
                        <div className="font-medium">{message.recipientName || 'Sem nome'}</div>
                        <div className="text-sm text-gray-500">{message.recipientNumber}</div>
                      </div>
                    </td>
                    <td className="border border-gray-300 p-3">
                      <div className="max-w-xs truncate" title={message.messageContent}>
                        {message.messageContent}
                      </div>
                    </td>
                    <td className="border border-gray-300 p-3">
                      {formatDateTime(message.scheduledDate)}
                    </td>
                    <td className="border border-gray-300 p-3">
                      {getStatusBadge(message.status)}
                      {message.errorMessage && (
                        <div className="text-xs text-red-600 mt-1" title={message.errorMessage}>
                          Erro: {message.errorMessage.substring(0, 50)}...
                        </div>
                      )}
                    </td>
                    <td className="border border-gray-300 p-3">
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
            
            {scheduledMessages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhuma mensagem agendada encontrada
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageScheduler;
