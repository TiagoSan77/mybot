import { Loader2, MessageCircle } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-600 p-4 rounded-full">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Carregando...</h2>
        </div>
        <p className="text-gray-600">Inicializando autenticação Firebase</p>
      </div>
    </div>
  );
}
