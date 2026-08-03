export interface HelpArticleFixture {
  id: string
  title: string
  category: string
  content: string
  views: number
  status: 'Publicado' | 'Rascunho'
  createdAt: string
}

export const MOCK_HELP_ARTICLES: HelpArticleFixture[] = [
  {
    id: 'art-1',
    title: 'Como conectar um canal WhatsApp via QR Code',
    category: 'Canais',
    content: 'Acesse o menu Configurações > Canais. Clique em Adicionar Canal, escolha a opção Evolution API GO e faça a leitura do QR Code exibido com o seu dispositivo WhatsApp.',
    views: 128,
    status: 'Publicado',
    createdAt: '2026-07-28'
  },
  {
    id: 'art-2',
    title: 'Configurando respostas rápidas acionadas por /',
    category: 'Configurações',
    content: 'Vá em Configurações > Respostas Rápidas. Cadastre o atalho desejado (ex: /boasvindas) e a mensagem padrão. Na caixa de envio, basta digitar o atalho.',
    views: 94,
    status: 'Publicado',
    createdAt: '2026-07-29'
  },
  {
    id: 'art-3',
    title: 'Entendendo a sumarização automática e relatórios de IA',
    category: 'IA & Automação',
    content: 'Ao encerrar um atendimento, a IA analisa a conversa e gera um resumo do assunto e motivo. Na tela de Relatórios, é possível gerar diagnósticos consolidados.',
    views: 62,
    status: 'Publicado',
    createdAt: '2026-07-30'
  }
]
