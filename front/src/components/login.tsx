import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Lock, User, Eye, EyeOff, Loader2, ArrowLeft, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import whatsappAPI from '../services/api';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const navigate = useNavigate();
    const { login, register } = useAuth();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        if (!formData.email.trim() || !formData.password.trim()) {
            setError('Email e senha são obrigatórios');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            if (isRegisterMode) {
                await register(formData.email, formData.password);
            } else {
                await login(formData.email, formData.password);
            }
            
            // Após autenticação bem-sucedida, obter token e configurar API
            const { getIdToken } = useAuth();
            const token = await getIdToken();
            whatsappAPI.setAuthToken(token);
            
            // Redirecionar para dashboard
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Erro de autenticação:', error);
            
            // Tratar diferentes tipos de erro do Firebase
            switch (error.code) {
                case 'auth/user-not-found':
                    setError('Usuário não encontrado');
                    break;
                case 'auth/wrong-password':
                    setError('Senha incorreta');
                    break;
                case 'auth/email-already-in-use':
                    setError('Este email já está em uso');
                    break;
                case 'auth/weak-password':
                    setError('A senha deve ter pelo menos 6 caracteres');
                    break;
                case 'auth/invalid-email':
                    setError('Email inválido');
                    break;
                default:
                    setError(isRegisterMode ? 'Erro ao criar conta' : 'Erro ao fazer login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        if (error) setError('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Botão voltar */}
                <div className="mb-4">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar ao início
                    </button>
                </div>

                {/* Logo e Título */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-green-600 p-3 rounded-full">
                            <MessageCircle className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Bot WhatsApp</h1>
                    <p className="text-gray-600">
                        {isRegisterMode ? 'Crie sua conta para começar' : 'Faça login para gerenciar suas sessões'}
                    </p>
                </div>

                {/* Formulário de Login */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Campo Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Digite seu email"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>

                        {/* Campo Senha */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Digite sua senha"
                                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    disabled={isLoading}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-gray-400 hover:text-gray-600"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Mensagem de Erro */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        {/* Botão de Login/Registro */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {isRegisterMode ? 'Criando conta...' : 'Fazendo login...'}
                                </>
                            ) : (
                                isRegisterMode ? 'Criar Conta' : 'Fazer Login'
                            )}
                        </button>
                    </form>

                    {/* Toggle entre Login e Registro */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsRegisterMode(!isRegisterMode);
                                setError('');
                            }}
                            className="text-green-600 hover:text-green-700 font-medium"
                            disabled={isLoading}
                        >
                            {isRegisterMode 
                                ? 'Já tem uma conta? Fazer login' 
                                : 'Não tem conta? Criar uma agora'
                            }
                        </button>
                    </div>

                    {/* Informações de Demo */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-md">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">🔥 Firebase Authentication</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>• Crie uma conta ou use uma existente</p>
                            <p>• Autenticação segura com Firebase</p>
                            <p>• Sessões isoladas por usuário</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-gray-600">
                    <p>© 2025 Bot WhatsApp. Todos os direitos reservados.</p>
                </div>
            </div>
        </div>
    );
}