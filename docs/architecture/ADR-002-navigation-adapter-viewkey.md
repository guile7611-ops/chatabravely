# ADR 002: Navegação Desacoplada por ViewKey sem Vue Router na Etapa 1

- **Status:** Aceito
- **Data:** 02 de Agosto de 2026
- **Contexto:** A especificação homologada (`DOCUMENTACAO_VERSAO_HOMOLOGADA.md` e `LOGICA.md`) determina que a navegação do painel é controlada pela reatividade da variável `currentView`. Não há dependência de Vue Router instalada no `package.json`.
- **Decisão:** Utilizar um tipo estrito `ViewKey` e um composable de navegação reativa `useNavigation` centralizado em `src/navigation/`, capaz de alternar entre as 7 visões homologadas (`conversas`, `kanban`, `contatos`, `relatorios`, `ajuda`, `simulador`, `configuracoes`).
- **Consequências:**
  - Evita instalação de dependências não aprovadas (`vue-router`).
  - Preserva a semântica reativa homologada do painel.
  - Permite substituição futura por roteamento por URL se aprovado via ADR em etapas posteriores.
