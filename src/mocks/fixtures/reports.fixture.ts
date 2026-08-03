export interface ExecutiveReportFixture {
  id: string
  title: string
  periodDays: number
  isBusinessHours: boolean
  createdAt: string
  tmaMinutes: string
  sentimentPositivePercent: string
  totalClosed: number
  summaryHtml: string
}

export const MOCK_EXECUTIVE_REPORTS: ExecutiveReportFixture[] = [
  {
    id: 'rep-1',
    title: 'Relatório Operacional — Últimos 7 Dias',
    periodDays: 7,
    isBusinessHours: true,
    createdAt: '2026-08-01 18:00',
    tmaMinutes: '6.8 min',
    sentimentPositivePercent: '94%',
    totalClosed: 142,
    summaryHtml: `
      <div class="space-y-4">
        <h3 class="text-sm font-bold text-[var(--text-primary)]">📊 Distribuição de Assuntos Recorrentes</h3>
        <ul class="list-disc pl-5 space-y-1 text-xs text-[var(--text-secondary)]">
          <li><strong>Dúvidas de Finanças e Segunda Via (42%):</strong> Alta concentração nas segundas-feiras.</li>
          <li><strong>Suporte Técnico e Acesso (35%):</strong> Resolução média em menos de 5 minutos.</li>
          <li><strong>Vendas e Orçamentos Corporativos (23%):</strong> Taxa de conversão de 68%.</li>
        </ul>

        <h3 class="text-sm font-bold text-[var(--text-primary)]">⏱️ Desempenho e SLA</h3>
        <p class="text-xs text-[var(--text-secondary)]">
          O Tempo Médio de Atendimento (TMA) registrou 6.8 minutos, com diminuição de 12% no tempo de espera da fila inicial.
        </p>

        <h3 class="text-sm font-bold text-[var(--text-primary)]">💡 Sugestões de Melhoria Operacional</h3>
        <ul class="list-disc pl-5 space-y-1 text-xs text-[var(--text-secondary)]">
          <li>Criar resposta rápida automatizada para envio de 2ª via de faturas.</li>
          <li>Reforçar a equipe do departamento comercial no período vespertino.</li>
        </ul>
      </div>
    `
  }
]
