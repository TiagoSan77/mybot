import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  Smartphone, 
  Users, 
  QrCode, 
  Shield, 
  Zap, 
  ArrowRight,
  CheckCircle,
  Globe,
  Database
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const features = [
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Múltiplas Sessões",
      description: "Gerencie várias contas do WhatsApp simultaneamente com facilidade"
    },
    {
      icon: <QrCode className="w-8 h-8 text-green-600" />,
      title: "QR Codes Automáticos",
      description: "Geração automática de QR codes em formato base64 para conexão rápida"
    },
    {
      icon: <Database className="w-8 h-8 text-green-600" />,
      title: "Armazenamento Persistente",
      description: "Dados salvos no MongoDB para maior segurança e persistência"
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: "API REST Segura",
      description: "Interface completa e segura para gerenciamento via HTTP"
    },
    {
      icon: <Zap className="w-8 h-8 text-green-600" />,
      title: "Status em Tempo Real",
      description: "Monitoramento do status das sessões em tempo real"
    },
    {
      icon: <Globe className="w-8 h-8 text-green-600" />,
      title: "Interface Moderna",
      description: "Dashboard responsivo e intuitivo para melhor experiência"
    }
  ];

  const benefits = [
    "Conecte múltiplas contas WhatsApp em um só lugar",
    "Gerencie sessões de forma centralizada",
    "QR codes gerados automaticamente",
    "Status de conexão em tempo real",
    "Interface moderna e responsiva",
    "API REST completa para integrações"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-green-600 p-2 rounded-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Bot WhatsApp</h1>
                <p className="text-xs text-gray-600">Multi-Sessões</p>
              </div>
            </div>
            <button
              onClick={handleLoginClick}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Fazer Login
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="bg-green-600 p-6 rounded-full">
                  <Smartphone className="w-16 h-16 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 bg-blue-500 p-2 rounded-full">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Bot WhatsApp
              <span className="block text-green-600">Multi-Sessões</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Uma solução completa para gerenciar múltiplas sessões do WhatsApp Web simultaneamente, 
              com QR codes automáticos e interface moderna.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleLoginClick}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
              >
                Acessar Dashboard
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades Principais
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tudo que você precisa para gerenciar suas sessões WhatsApp de forma eficiente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Por que escolher nosso Bot WhatsApp?
              </h2>
              <p className="text-green-100 text-lg mb-8">
                Uma solução robusta e confiável para suas necessidades de automação do WhatsApp
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-200 flex-shrink-0" />
                    <span className="text-white">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <div className="text-center">
                <QrCode className="w-24 h-24 text-white mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">
                  Comece Agora
                </h3>
                <p className="text-green-100 mb-6">
                  Acesse o dashboard e crie sua primeira sessão WhatsApp em minutos
                </p>
                <button
                  onClick={handleLoginClick}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  Fazer Login
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Tecnologias Utilizadas
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Construído com as melhores tecnologias para performance e confiabilidade
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: "Node.js", desc: "Backend robusto" },
              { name: "TypeScript", desc: "Código tipado" },
              { name: "React", desc: "Interface moderna" },
              { name: "MongoDB", desc: "Banco de dados" },
              { name: "Express.js", desc: "API REST" },
              { name: "WhatsApp Web.js", desc: "Integração WhatsApp" },
              { name: "Tailwind CSS", desc: "Design responsivo" },
              { name: "Vite", desc: "Build otimizado" }
            ].map((tech, index) => (
              <div key={index} className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <div className="w-6 h-6 bg-green-600 rounded"></div>
                </div>
                <h3 className="font-semibold text-gray-900">{tech.name}</h3>
                <p className="text-sm text-gray-600">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Acesse o dashboard e crie sua primeira sessão WhatsApp agora mesmo
          </p>
          <button
            onClick={handleLoginClick}
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
          >
            Acessar Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="bg-green-600 p-2 rounded-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Bot WhatsApp Multi-Sessões</span>
            </div>
            <p className="text-gray-400 mb-4">
              Solução completa para gerenciamento de múltiplas sessões WhatsApp
            </p>
            <p className="text-gray-500 text-sm">
              © 2025 Bot WhatsApp. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
