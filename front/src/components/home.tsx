import { useState } from 'react';
import Header from "./ui/Header";
import SessionList from "./ui/SessionList";
import CreateSessionModal from "./ui/CreateSessionModal";
import QRCodeModal from "./ui/QRCodeModal";

export default function Home() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [qrModal, setQrModal] = useState<{isOpen: boolean, sessionId: string, sessionName: string}>({
        isOpen: false,
        sessionId: '',
        sessionName: ''
    });
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleCreateSession = () => {
        setIsCreateModalOpen(true);
    };

    const handleSessionCreated = () => {
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

    return (
        <div className="min-h-screen bg-gray-50">
            <Header 
                onCreateSession={handleCreateSession}
                onRefresh={handleRefresh}
            />
            
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
        </div>
    );
}