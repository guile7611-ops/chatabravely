"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
/**
 * POST /api/v1/users/login
 * Autenticar usuário e gerar Token JWT com validação real de senha via bcrypt
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios' });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
            include: { departments: true }
        });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Credenciais inválidas: e-mail ou senha incorretos.' });
        }
        // Validar hash de senha via bcrypt
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Credenciais inválidas: e-mail ou senha incorretos.' });
        }
        const token = (0, auth_middleware_1.generateUserToken)(user);
        return res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                workspaceId: user.workspaceId,
                departmentIds: user.departments.map(d => d.id)
            }
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
// Todas as rotas abaixo exigem obrigatoriamente Autenticação JWT
router.use(auth_middleware_1.authenticateToken);
/**
 * GET /api/v1/users
 * Listar todos os membros da equipe do Workspace do usuário autenticado (Isolamento por Tenant)
 */
router.get('/', async (req, res) => {
    try {
        const user = req.user;
        // NUNCA aceitar workspaceId por query string: Usar exclusivamente req.user.workspaceId
        const users = await prisma_1.prisma.user.findMany({
            where: { workspaceId: user.workspaceId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatarUrl: true,
                isOnline: true,
                workspaceId: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return res.json({ success: true, count: users.length, users });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * POST /api/v1/users
 * Cadastrar um novo acesso de usuário (Gestor ou Atendente) - Exclusivo para ADMIN do mesmo Workspace
 */
router.post('/', auth_middleware_1.requireAdmin, async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const adminUser = req.user;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Nome, E-mail e Senha são obrigatórios' });
        }
        const validRole = role === 'ADMIN' ? 'ADMIN' : 'AGENT';
        // Verificar se o e-mail já está cadastrado
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() }
        });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Este e-mail já está cadastrado na plataforma.' });
        }
        // Criar hash seguro da senha com bcrypt
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = await prisma_1.prisma.user.create({
            data: {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                role: validRole,
                workspaceId: adminUser.workspaceId,
                isOnline: true
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatarUrl: true,
                isOnline: true,
                createdAt: true
            }
        });
        console.log(`👤 [UserRoutes] Novo membro criado por ${adminUser.name}: ${newUser.name} (${newUser.role})`);
        return res.status(201).json({ success: true, user: newUser });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * DELETE /api/v1/users/:id
 * Excluir um acesso da equipe do mesmo Workspace - Exclusivo para ADMIN
 */
router.delete('/:id', auth_middleware_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const adminUser = req.user;
        // Validar se o usuário a ser deletado pertence ao mesmo workspace do admin
        const targetUser = await prisma_1.prisma.user.findFirst({
            where: { id: id, workspaceId: adminUser.workspaceId }
        });
        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'Usuário não localizado no workspace.' });
        }
        await prisma_1.prisma.user.delete({ where: { id: id } });
        return res.json({ success: true, message: 'Membro removido da equipe com sucesso.' });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
