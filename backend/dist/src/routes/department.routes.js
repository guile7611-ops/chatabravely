"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
/**
 * GET /api/v1/departments
 * Listar departamentos do workspace autenticado
 */
router.get('/', async (req, res) => {
    try {
        const user = req.user;
        const departments = await prisma_1.prisma.department.findMany({
            where: { workspaceId: user.workspaceId },
            orderBy: { name: 'asc' }
        });
        return res.json({
            success: true,
            count: departments.length,
            departments
        });
    }
    catch (error) {
        console.error('❌ Erro ao listar departamentos:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
