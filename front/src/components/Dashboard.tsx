import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import whatsappAPI from '../services/api';
import Header from "./ui/Header";
import SessionList from "./ui/SessionList";
import CreateSessionModal from "./ui/CreateSessionModal";
import QRCodeModal from "./ui/QRCodeModal";
import SendMessageModal from "./ui/SendMessageModal";
import type { Session, SendMessageResponse } from '../types/api';

export default function Dashboard() {
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
            
            {/* Barra de usuário */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-12">
                        <div className="text-sm text-gray-600">
                            Bem-vindo, <span className="font-medium">{userDisplayName}</span>
                            {user?.email && <span className="ml-2 text-xs text-gray-500">({user.email})</span>}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sair
                        </button>
                    </div>
                </div>
            </div>
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Gerenciar Sessões WhatsApp</h2>
                    <p className="text-gray-600">
                        Crie e gerencie múltiplas sessões do WhatsApp Web simultaneamente
                    </p>
                </div>

                <SessionList 
                    onShowQR={handleShowQR}
                    refreshTrigger={refreshTrigger}
                />
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
