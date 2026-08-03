"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const prisma_1 = require("../lib/prisma");
class ReportService {
    /**
     * Compilar Relatorio Executivo dos ultimos N dias (7, 14 ou 30 dias)
     */
    static async generateExecutiveReport(workspaceId, days = 7, createdByName) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            // 1. Estatisticas de Conversas
            const totalConversations = await prisma_1.prisma.conversation.count({
                where: {
                    workspaceId: workspaceId,
                    createdAt: { gte: startDate }
                }
            });
            const closedConversations = await prisma_1.prisma.conversation.count({
                where: {
                    workspaceId: workspaceId,
                    status: 'CLOSED',
                    createdAt: { gte: startDate }
                }
            });
            const openConversations = await prisma_1.prisma.conversation.count({
                where: {
                    workspaceId: workspaceId,
                    status: { in: ['UNATTENDED', 'OPEN'] }
                }
            });
            // 2. Estatisticas de Mensagens
            const totalMessages = await prisma_1.prisma.message.count({
                where: {
                    conversation: { workspaceId: workspaceId },
                    createdAt: { gte: startDate }
                }
            });
            // 3. Canais e Contatos
            const activeChannels = await prisma_1.prisma.channel.count({
                where: { workspaceId: workspaceId }
            });
            const totalContacts = await prisma_1.prisma.contact.count({
                where: { workspaceId: workspaceId }
            });
            const taxaResolucao = totalConversations > 0
                ? Math.round((closedConversations / totalConversations) * 100)
                : 100;
            const summaryText = `📊 RELATÓRIO EXECUTIVO DE DESEMPENHO (${days} DIAS)
--------------------------------------------------
• Total de Conversas Criadas: ${totalConversations}
• Atendimentos Concluídos: ${closedConversations} (${taxaResolucao}% de Resolução)
• Atendimentos Em Aberto: ${openConversations}
• Volume Total de Mensagens: ${totalMessages}
• Base de Contatos Ativos: ${totalContacts}
• Conexões WhatsApp Ativas: ${activeChannels}
--------------------------------------------------
💡 Destaque Executivo: O sistema manteve ${taxaResolucao}% de taxa de resolução nos últimos ${days} dias, registrando um volume médio de ${Math.round(totalMessages / (days || 1))} mensagens por dia.`;
            // 4. Salvar Relatorio Executivo no PostgreSQL
            const savedReport = await prisma_1.prisma.savedExecutiveSummary.create({
                data: {
                    title: `Relatório Executivo ${days} Dias (${new Date().toLocaleDateString('pt-BR')})`,
                    summary: summaryText,
                    days: days,
                    businessHoursOnly: false,
                    createdByName: createdByName || 'Sistema de Inteligência',
                    workspaceId: workspaceId
                }
            });
            console.log(`📊 [ReportService] Relatório executivo de ${days} dias gerado e salvo ID: ${savedReport.id}`);
            return savedReport;
        }
        catch (error) {
            console.error('❌ [ReportService] Erro ao gerar relatório executivo:', error);
            throw error;
        }
    }
    /**
     * Listar relatorios salvos no Workspace
     */
    static async getSavedReports(workspaceId) {
        return prisma_1.prisma.savedExecutiveSummary.findMany({
            where: { workspaceId: workspaceId },
            orderBy: { createdAt: 'desc' }
        });
    }
}
exports.ReportService = ReportService;
