import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: A variável de ambiente JWT_SECRET é obrigatória em produção.');
    }
    return 'abravely-chat-jwt-secret-2026';
  }
  return secret;
};

export const JWT_SECRET = getJwtSecret();

export interface AuthenticatedUserPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  workspaceId: string;
  departmentIds: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUserPayload;
    }
  }
}

/**
 * Gerar Token JWT assinado para um usuário
 */
export function generateUserToken(user: { id: string; email: string; name: string; role: string; workspaceId: string }): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      workspaceId: user.workspaceId
    },
    getJwtSecret(),
    { expiresIn: '30d' }
  );
}

/**
 * Middleware para Autenticação JWT Obrigatória (somente via Authorization: Bearer <token>)
 */
export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acesso não autorizado: Token JWT de autenticação não fornecido via Authorization Bearer.'
      });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Acesso não autorizado: Token JWT inválido ou expirado.'
      });
    }

    // Carregar os dados atualizados do usuário e seus departamentos do PostgreSQL
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { departments: { select: { id: true } } }
    });

    if (!dbUser) {
      return res.status(401).json({
        success: false,
        message: 'Acesso não autorizado: Usuário não localizado no sistema.'
      });
    }

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      workspaceId: dbUser.workspaceId,
      departmentIds: dbUser.departments.map(d => d.id)
    };

    next();
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao processar a autenticação',
      error: error.message
    });
  }
}

/**
 * Middleware para exigir perfil ADMIN (Gestor)
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado: Esta ação é restrita a usuários com perfil de Gestor (ADMIN).'
    });
  }
  next();
}
