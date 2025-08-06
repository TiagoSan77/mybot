import { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import AppConfig from '../config/app';

// Interface para usuário autenticado
export interface AuthenticatedUser {
  uid: string;
  email?: string | undefined;
  name?: string | undefined;
  email_verified?: boolean | undefined;
}

// Estender Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

class FirebaseAdmin {
  private static initialized = false;

  public static initialize() {
    if (this.initialized || getApps().length > 0) {
      return;
    }

    try {
      // Para desenvolvimento, podemos usar credenciais default ou arquivo de serviço
      // Em produção, configurar variáveis de ambiente adequadas
      const config = AppConfig.getInstance();
      
      // Se houver GOOGLE_APPLICATION_CREDENTIALS ou service account key
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        initializeApp({
          credential: cert(serviceAccount),
          projectId: 'clientlogin-33401'
        });
      } else {
        // Usar credenciais default (funciona no Google Cloud)
        initializeApp({
          projectId: 'clientlogin-33401'
        });
      }

      this.initialized = true;
      console.log('🔐 Firebase Admin inicializado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao inicializar Firebase Admin:', error);
      // Em desenvolvimento, continuar sem autenticação
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️  Continuando em modo desenvolvimento sem autenticação Firebase');
      }
    }
  }
}

// Middleware para verificar token Firebase
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Inicializar Firebase Admin se necessário
    FirebaseAdmin.initialize();

    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token de acesso requerido. Use: Authorization: Bearer <token>'
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
      return;
    }

    // Verificar token com Firebase Admin
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    
    // Adicionar informações do usuário à requisição
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || undefined,
      name: decodedToken.name || undefined,
      email_verified: decodedToken.email_verified || undefined
    };

    console.log(`🔓 Usuário autenticado: ${req.user?.email} (${req.user?.uid})`);
    next();

  } catch (error) {
    console.error('❌ Erro na autenticação:', error);
    
    // Em desenvolvimento, permitir acesso sem autenticação
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Modo desenvolvimento: Pulando autenticação Firebase');
      req.user = {
        uid: 'dev-user',
        email: 'dev@example.com',
        name: 'Usuário de Desenvolvimento'
      };
      next();
      return;
    }

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
};

// Middleware opcional para rotas que podem ter usuário autenticado ou não
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Tentar autenticar se token foi fornecido
      await authenticateToken(req, res, next);
    } else {
      // Continuar sem autenticação
      next();
    }
  } catch (error) {
    // Em caso de erro, continuar sem autenticação
    next();
  }
};

export default { authenticateToken, optionalAuth };
