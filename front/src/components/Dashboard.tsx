import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, Plus, Send, QrCode, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import whatsappAPI from '../services/api';
import Header from "./ui/Header";
import SessionList from "./ui/SessionList";
import CreateSessionModal from "./ui/CreateSessionModal";
import QRCodeModal from "./ui/QRCodeModal";
import SendMessageModal from "./ui/SendMessageModal";
import MessageScheduler from "./MessageScheduler";
import type { Session, SendMessageResponse } from '../types/api';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState<'sessions' | 'scheduler'>('sessions');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSendMessageModalOpen, setIsSendMessageModalOpen] = useState(false);
    const [qrModal, setQrModal] = useState<{isOpen: boolean, sessionId: string, sessionName: string}>({
        isOpen: false,
        sessionId: '',
        sessionName: ''
    });
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [userSessions, setUserSessions] = useState<Session[]>([]);
    const navigate = useNavigate();
    const { user, logout, getIdToken } = useAuth();

    // Configurar token da API quando usuário mudar
    useEffect(() => {
        const setupAuthToken = async () => {
            if (user) {
                const token = await getIdToken();
                whatsappAPI.setAuthToken(token);
            }
        };
        setupAuthToken();
    }, [user, getIdToken]);

    // Carregar sessões do usuário
    useEffect(() => {
        const loadSessions = async () => {
            try {
                const response = await whatsappAPI.getSessions();
                setUserSessions(response.sessions);
            } catch (error) {
                console.error('Erro ao carregar sessões:', error);
            }
        };

        if (user) {
            loadSessions();
        }
    }, [user, refreshTrigger]);

    const handleCreateSession = () => {
        setIsCreateModalOpen(true);
    };

    const handleSendMessage = () => {
        setIsSendMessageModalOpen(true);
    };

    const handleSessionCreated = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleMessageSent = (result: SendMessageResponse) => {
        console.log('Mensagem enviada:', result);
        // Opcional: mostrar notificação de sucesso
        // Refresh das sessões para atualizar status
        setRefreshTrigger(prev => prev + 1);
    };

    const handleShowQR = (sessionId: string, sessionName: string) => {
        setQrModal({
            isOpen: true,
            sessionId,
            sessionName
        });
    };

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleLogout = async () => {
        if (window.confirm('Tem certeza que deseja sair?')) {
            try {
                await logout();
                whatsappAPI.setAuthToken(null);
                navigate('/login');
            } catch (error) {
                console.error('Erro ao fazer logout:', error);
            }
        }
    };

    // Obter dados do usuário
    const userDisplayName = user?.email || user?.displayName || 'Usuário';

    return (
        <div className="min-h-screen bg-gray-50">
            <Header 
                onCreateSession={handleCreateSession}
                onSendMessage={handleSendMessage}
                onRefresh={handleRefresh}
            />
            
            {/* Barra de usuário - apenas desktop */}
            <div className="bg-white border-b border-gray-200 hidden md:block">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 sm:h-12 space-y-2 sm:space-y-0">
                        <div className="text-sm text-gray-600 truncate max-w-full">
                            Bem-vindo, <span className="font-medium">{userDisplayName}</span>
                            {user?.email && <span className="ml-2 text-xs text-gray-500 hidden sm:inline">({user.email})</span>}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors whitespace-nowrap"
                        >
                            <LogOut className="w-4 h-4" />
                            Sair
                        </button>
                    </div>
                </div>
            </div>
            
            <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
                {/* Navegação por abas */}
                <div className="mb-6 sm:mb-8">
                    {/* Menu Mobile */}
                    <div className="md:hidden mb-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="flex items-center justify-between w-full p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                        >
                            <span className="font-medium text-gray-900">
                                {activeTab === 'sessions' ? '📱 Sessões WhatsApp' : '📅 Agendador de Mensagens'}
                            </span>
                            {isMobileMenuOpen ? (
                                <X className="w-5 h-5 text-gray-500" />
                            ) : (
                                <Menu className="w-5 h-5 text-gray-500" />
                            )}
                        </button>
                        
                        {isMobileMenuOpen && (
                            <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                                {/* Informações do usuário no mobile */}
                                <div className="p-3 border-b border-gray-100 bg-gray-50">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <span className="text-green-600 font-semibold text-sm">
                                                {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{userDisplayName}</p>
                                            {user?.email && (
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Navegação por Abas */}
                                <div className="border-b border-gray-100">
                                    <button
                                        onClick={() => {
                                            setActiveTab('sessions');
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={`w-full text-left p-3 flex items-center space-x-3 ${
                                            activeTab === 'sessions'
                                                ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="text-lg">📱</span>
                                        <span className="font-medium">Sessões WhatsApp</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveTab('scheduler');
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={`w-full text-left p-3 flex items-center space-x-3 ${
                                            activeTab === 'scheduler'
                                                ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="text-lg">📅</span>
                                        <span className="font-medium">Agendador de Mensagens</span>
                                    </button>
                                </div>

                                {/* Ações Rápidas */}
                                <div className="py-2">
                                    <button
                                        onClick={() => {
                                            setIsCreateModalOpen(true);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full text-left p-3 flex items-center space-x-3 text-green-600 hover:bg-green-50"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span className="font-medium">Nova Sessão</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsSendMessageModalOpen(true);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full text-left p-3 flex items-center space-x-3 text-blue-600 hover:bg-blue-50"
                                    >
                                        <Send className="w-5 h-5" />
                                        <span className="font-medium">Enviar Mensagem</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigate('/qr');
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full text-left p-3 flex items-center space-x-3 text-gray-700 hover:bg-gray-50"
                                    >
                                        <QrCode className="w-5 h-5" />
                                        <span className="font-medium">Ver QR Codes</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleRefresh();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full text-left p-3 flex items-center space-x-3 text-gray-700 hover:bg-gray-50"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                        <span className="font-medium">Atualizar Sessões</span>
                                    </button>
                                    <div className="border-t border-gray-100 mt-2 pt-2">
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full text-left p-3 flex items-center space-x-3 text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            <span className="font-medium">Sair</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Menu Desktop */}
                    <div className="hidden md:block border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('sessions')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                                    activeTab === 'sessions'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                📱 Sessões WhatsApp
                            </button>
                            <button
                                onClick={() => setActiveTab('scheduler')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                                    activeTab === 'scheduler'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                📅 Agendador de Mensagens
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Conteúdo das abas */}
                {activeTab === 'sessions' && (
                    <div className="space-y-6">
                        <div className="text-center sm:text-left">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Gerenciar Sessões WhatsApp</h2>
                            <p className="text-sm sm:text-base text-gray-600">
                                Crie e gerencie múltiplas sessões do WhatsApp Web simultaneamente
                            </p>
                        </div>

                        <SessionList 
                            onShowQR={handleShowQR}
                            refreshTrigger={refreshTrigger}
                        />
                    </div>
                )}

                {activeTab === 'scheduler' && (
                    <MessageScheduler />
                )}
            </main>

            <CreateSessionModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSessionCreated={handleSessionCreated}
            />

            <QRCodeModal
                isOpen={qrModal.isOpen}
                onClose={() => setQrModal(prev => ({ ...prev, isOpen: false }))}
                sessionId={qrModal.sessionId}
                sessionName={qrModal.sessionName}
            />

            <SendMessageModal
                isOpen={isSendMessageModalOpen}
                onClose={() => setIsSendMessageModalOpen(false)}
                userSessions={userSessions}
                onMessageSent={handleMessageSent}
            />
        </div>
    );
}
