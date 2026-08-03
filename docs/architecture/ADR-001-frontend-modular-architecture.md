# ADR 001: Arquitetura Modular do Frontend e Isolamento de Mocks

- **Status:** Aceito
- **Data:** 02 de Agosto de 2026
- **Contexto:** O frontend atual possuía um arquivo `src/App.vue` monolítico com estilos e lógicas acopladas. Para garantir a qualidade enterprise e a evolução por etapas sem quebrar contratos, é necessária uma arquitetura modular por camadas baseada nos princípios do Feature-Sliced Design / Clean Architecture.
- **Decisão:** Estruturar a pasta `src/` nas seguintes camadas isoladas:
  - `app/`: bootstrap, estilos globais (`tokens.css`), providers e composição da raiz.
  - `navigation/`: mapa e estado de navegação por `ViewKey` local desacoplada de roteadores de URL.
  - `layouts/`: `AppShell`, `Sidebar` e `Header`.
  - `pages/`: os shells visuais das 7 views homologadas.
  - `shared/ui/`: biblioteca de componentes reutilizáveis do `DESIGN_SYSTEM.md`.
  - `entities/`: tipos de domínio de apresentação isolados.
  - `mocks/`: fixtures determinísticas e adaptadores locais.
- **Consequências:** 
  - Maior desacoplamento e facilidade de substituição dos dados mockados por integrações reais na Etapa 2.
  - Manutenção de um build compilável e seguro a cada passo sem reescrita destrutiva em massa.
