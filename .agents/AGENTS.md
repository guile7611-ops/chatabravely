# Regras Específicas do Projeto (Abravely Chat 1.0)

<RULE[project_abravely]>
1. **Navegador e Teste de UI**: O agente NÃO deve abrir o subagente de navegador (`browser_subagent`) para visualizar a tela ou testar componentes visuais. O usuário fará o teste visual localmente e enviará screenshots quando necessário.
2. **Snapshot / Backup automático a cada 5 pedidos**: A cada 5 solicitações do usuário, deve ser criado um snapshot (commit com mensagem clara das alterações) e enviado (push) para o repositório remoto: https://github.com/guile7611-ops/chatabravely
3. **Comunicação em Português**: Todos os planos, tasks, explicações e respostas devem ser entregues em português.
</RULE[project_abravely]>
