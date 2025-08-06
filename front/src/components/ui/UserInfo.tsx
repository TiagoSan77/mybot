import { User as FirebaseUser, Shield, Clock, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function UserInfo() {
  const { user } = useAuth();

  if (!user) return null;

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-green-100 p-2 rounded-lg">
          <FirebaseUser className="w-5 h-5 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Informações do Usuário</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Mail className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">Email</p>
            <p className="text-sm text-gray-600">{user.email || 'N/A'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Shield className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">UID</p>
            <p className="text-sm text-gray-600 font-mono">{user.uid}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">Criado em</p>
            <p className="text-sm text-gray-600">{formatDate(user.metadata.creationTime)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">Último login</p>
            <p className="text-sm text-gray-600">{formatDate(user.metadata.lastSignInTime)}</p>
          </div>
        </div>

        {user.emailVerified && (
          <div className="flex items-center gap-2 mt-4 p-2 bg-green-50 rounded-md">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Email verificado</span>
          </div>
        )}
      </div>
    </div>
  );
}
