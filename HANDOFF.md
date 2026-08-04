# Passagem de contexto — Abravely Chat

Este arquivo permite continuar o desenvolvimento em outra conta sem depender do
histórico desta conversa. Leia-o antes de alterar arquivos ou reiniciar serviços.

## Projeto e repositório

- Pasta local: `C:\Users\guilh\Desktop\AGORA VAI`
- Repositório: `https://github.com/guile7611-ops/chatabravely`
- Último commit remoto conhecido: `c508db7` — `Versão estruturada 0.1 - Terminar apis central de ajuda`
- Frontend: Vue 3 + Vite, iniciado com `npm run dev` na porta `5173`.
- Backend: Express + Prisma + Socket.IO, fornecido pelo serviço Docker
  `agoravai-backend-api` na porta `3000`.

> Importante: há alterações locais **ainda não commitadas**. Não use `git reset`,
> `git checkout -- .`, `git clean`, nem apague `dist/` ou `backend/dist/`, pois
> essas pastas já estavam sujas antes da passagem e podem conter trabalho local.

## Como iniciar o ambiente

No PowerShell, na raiz do projeto:

```powershell
docker compose up -d
npm run dev
```

Abra `http://localhost:5173`.

Verificações úteis:

```powershell
docker compose ps
Invoke-WebRequest http://localhost:3000/health
```

O PostgreSQL é o container `agoravai-postgres`. Se o backend responder 500 com
`Can't reach database server`, verifique Docker Desktop e execute
`docker compose up -d postgres backend-api`.

## O que já foi corrigido

### Estabilidade geral

- O app voltou a renderizar login, sidebar e dashboard depois de problemas de
  bootstrap/rotas e conta `null`.
- O backend usa PostgreSQL/Prisma reais; não foram deixados fallbacks falsos de
  login, usuário, workspace ou Socket.IO quando o banco está indisponível.
- A sessão usa JWT do backend Express para chamadas `/api/v1` e Socket.IO.

### Sidebar e contatos

- Itens de submenu da sidebar foram reduzidos em fonte/ícone de forma genérica,
  não apenas em Conversas.
- Foram feitas alterações locais anteriores para remover recursos não usados,
  como ações de Copilot/Twilio, simplificar Contatos e ajustar controles de
  conversa. Revise as mudanças locais antes de novos refactors.

### Central de Ajuda — migração em andamento, funcional

O frontend herdado chamava endpoints de `portals` do Chatwoot que não existem no
backend Express. A Central de Ajuda foi migrada para APIs reais do Abravely:

- Categorias: `/api/v1/help/categories`
- Artigos: `/api/v1/help/articles`
- Operações incluídas: listar, pesquisar, criar, editar, excluir, reordenar e
  ações em massa; todas isoladas por workspace e protegidas por JWT.
- Prisma recebeu `HelpCategory`, o enum `HelpArticleStatus` e relações de
  categoria/autor no artigo. O schema já foi aplicado ao banco local com
  `prisma db push`.
- O clique em um artigo deixou de depender do modal legado: agora navega para a
  rota real de edição/leitura e busca o artigo pela API.
- Datas nos cartões de artigo agora são exibidas em `pt-BR`, por exemplo
  `04/08/2026, 16:08`, em vez do ISO cru.

Arquivos principais dessa migração:

- `backend/prisma/schema.prisma`
- `backend/src/routes/help.routes.ts`
- `app/javascript/dashboard/api/helpCenter/articles.js`
- `app/javascript/dashboard/api/helpCenter/categories.js`
- `app/javascript/dashboard/store/modules/helpCenterArticles/`
- `app/javascript/dashboard/store/modules/helpCenterCategories/`
- `app/javascript/dashboard/routes/dashboard/helpcenter/`
- `app/javascript/dashboard/components-next/HelpCenter/`

## Validações já executadas

- CRUD real temporário de categoria/artigo contra o backend local: aprovado.
- Build TypeScript do backend: aprovado.
- Testes Vitest focados em artigos e categorias: 59 testes aprovados.
- Build de produção do frontend: aprovado, usando diretório temporário para não
  modificar `dist/`.
- O build apresenta avisos legados de Sass e tamanho de chunks; não bloqueiam a
  compilação atual.

## Estado atual e próxima ação recomendada

1. No navegador, faça `Ctrl + F5` e abra **Central de Ajuda**.
2. Clique em um artigo. Ele deve abrir a tela do artigo por uma URL contendo
   `/edit/<id-do-artigo>`.
3. Confirme criação, edição e exclusão de um artigo e de uma categoria.
4. Só então organize um commit seletivo: inclua arquivos fonte e testes, mas
   mantenha `dist/` e `backend/dist/` fora do commit.

Se houver falha, anote a URL, a requisição que falhou na aba Network e a resposta
HTTP. Não recrie dados no frontend para esconder erros de API.

## Comandos de validação sugeridos

```powershell
# Frontend (não grava no dist rastreado)
$validationDir = Join-Path $env:TEMP 'agoravai-validation'
npm run build -- --outDir $validationDir

# Testes da Central de Ajuda
npx vitest run app/javascript/dashboard/store/modules/helpCenterArticles/specs/action.spec.js app/javascript/dashboard/store/modules/helpCenterArticles/specs/getters.spec.js app/javascript/dashboard/store/modules/helpCenterArticles/specs/mutation.spec.js app/javascript/dashboard/store/modules/helpCenterCategories/specs/actions.spec.js app/javascript/dashboard/store/modules/helpCenterCategories/specs/getters.spec.js app/javascript/dashboard/store/modules/helpCenterCategories/specs/mutations.spec.js --no-coverage

# Conferir alterações antes de versionar
git status --short
git diff --check
```
