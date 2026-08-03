import { prisma } from '../lib/prisma';

export class ReportService {
  /**
   * Compilar Relatorio Executivo dos ultimos N dias (7, 14 ou 30 dias)
   */
  static async generateExecutiveReport(workspaceId: string, days: number = 7, createdByName?: string) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // 1. Estatisticas de Conversas
      const totalConversations = await prisma.conversation.count({
        where: {
          workspaceId: workspaceId,
          createdAt: { gte: startDate }
        }
      });

      const closedConversations = await prisma.conversation.count({
        where: {
          workspaceId: workspaceId,
          status: 'CLOSED',
          createdAt: { gte: startDate }
        }
      });

      const openConversations = await prisma.conversation.count({
        where: {
          workspaceId: workspaceId,
          status: { in: ['UNATTENDED', 'OPEN'] }
        }
      });

      // 2. Estatisticas de Mensagens
      const totalMessages = await prisma.message.count({
        where: {
          conversation: { workspaceId: workspaceId },
          createdAt: { gte: startDate }
        }
      });

      // 3. Canais e Contatos
      const activeChannels = await prisma.channel.count({
        where: { workspaceId: workspaceId }
      });

      const totalContacts = await prisma.contact.count({
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
      const savedReport = await prisma.savedExecutiveSummary.create({
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
    } catch (error: any) {
      console.error('❌ [ReportService] Erro ao gerar relatório executivo:', error);
      throw error;
    }
  }

  /**
   * Listar relatorios salvos no Workspace
   */
  static async getSavedReports(workspaceId: string) {
    return prisma.savedExecutiveSummary.findMany({
      where: { workspaceId: workspaceId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
