"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = exports.getJwtSecret = void 0;
exports.generateUserToken = generateUserToken;
exports.authenticateToken = authenticateToken;
exports.requireAdmin = requireAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('FATAL: A variável de ambiente JWT_SECRET é obrigatória em produção.');
        }
        return 'abravely-chat-jwt-secret-2026';
    }
    return secret;
};
exports.getJwtSecret = getJwtSecret;
exports.JWT_SECRET = (0, exports.getJwtSecret)();
/**
 * Gerar Token JWT assinado para um usuário
 */
function generateUserToken(user) {
    return jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        workspaceId: user.workspaceId
    }, (0, exports.getJwtSecret)(), { expiresIn: '30d' });
}
/**
 * Middleware para Autenticação JWT Obrigatória (somente via Authorization: Bearer <token>)
 */
async function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Acesso não autorizado: Token JWT de autenticação não fornecido via Authorization Bearer.'
            });
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, (0, exports.getJwtSecret)());
        }
        catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Acesso não autorizado: Token JWT inválido ou expirado.'
            });
        }
        // Carregar os dados atualizados do usuário e seus departamentos do PostgreSQL
        const dbUser = await prisma_1.prisma.user.findUnique({
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
    }
    catch (error) {
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
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            message: 'Acesso negado: Esta ação é restrita a usuários com perfil de Gestor (ADMIN).'
        });
    }
    next();
}
