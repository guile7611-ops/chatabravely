<template>
  <main class="min-h-screen overflow-x-hidden bg-[#00001b] text-white font-sans antialiased text-left select-none">
    
    <!-- 2. NAVBAR -->
    <nav class="sticky top-0 z-50 border-b border-[#5c63f1]/30 bg-[rgba(0,0,27,0.85)] backdrop-blur-2xl">
      <div class="relative flex items-center justify-between px-4 py-4 md:px-[112px]">
        <a class="flex items-center gap-2.5 hover:opacity-90 transition-opacity" href="#">
          <img src="/images/abravely-logo-novo.png" alt="Abravely" class="h-9 w-9 md:h-11 md:w-11 object-contain" @error="handleLogoError" />
          <span class="text-lg font-black tracking-[-0.3px] text-white md:text-xl">Abravely Chat</span>
        </a>
        
        <div class="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 sm:flex">
          <a class="text-sm font-medium tracking-[-0.3px] text-white/80 transition-colors hover:text-white" href="#whatsapp">
            WhatsApp Inteligente
          </a>
          <a class="text-sm font-medium tracking-[-0.3px] text-white/80 transition-colors hover:text-white" href="#integracoes">
            Integrações
          </a>
          <a class="text-sm font-medium tracking-[-0.3px] text-white/80 transition-colors hover:text-white" href="#precos">
            Planos & Preços
          </a>
        </div>

        <div class="hidden items-center gap-4 sm:flex">
          <button @click="$emit('go-to-login')" class="rounded-[10px] bg-[#5c63f1] hover:bg-[#484fdf] px-6 py-2 text-sm font-bold tracking-[-0.3px] text-white transition-colors cursor-pointer">
            Entrar
          </button>
        </div>

        <button 
          class="p-2 text-white transition-colors hover:text-gray-300 sm:hidden cursor-pointer" 
          @click="mobileMenuOpen = true"
          aria-label="Abrir menu"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <!-- GAVETA DE MENU MOBILE -->
      <div :class="['drawer-overlay', mobileMenuOpen ? 'open' : '']" @click="mobileMenuOpen = false" />
      <div :class="['navbar-mobile-drawer', mobileMenuOpen ? 'open' : '']">
        <div class="flex items-center justify-between mb-8">
          <a class="flex items-center gap-2" href="#">
            <img src="/images/abravely-logo-novo.png" alt="Abravely" class="h-8 w-8 object-contain" />
            <span class="text-lg font-black tracking-[-0.3px] text-white">Abravely Chat</span>
          </a>
          <button @click="mobileMenuOpen = false" aria-label="Fechar menu" class="cursor-pointer">
            <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="flex flex-col gap-6 text-left">
          <a href="#whatsapp" @click="mobileMenuOpen = false" class="text-base font-semibold text-white/80 hover:text-white">WhatsApp Inteligente</a>
          <a href="#integracoes" @click="mobileMenuOpen = false" class="text-base font-semibold text-white/80 hover:text-white">Integrações</a>
          <a href="#precos" @click="mobileMenuOpen = false" class="text-base font-semibold text-white/80 hover:text-white">Planos & Preços</a>

          <div class="h-[1px] bg-white/10 my-2" />
          <button @click="mobileMenuOpen = false; $emit('go-to-login')" class="rounded-[10px] bg-[#5c63f1] py-3 text-center text-base font-semibold text-white cursor-pointer">
            Entrar
          </button>
        </div>
      </div>
    </nav>

    <!-- 3. HERO SECTION -->
    <section class="relative bg-[#00001b]">
      <div class="relative px-4 md:px-[112px] 2xl:px-[160px]">
        
        <!-- Gradiente luminoso à esquerda -->
        <svg class="opacity-45 pointer-events-none absolute -left-[300px] -top-[200px] h-[600px] w-[500px] blur-[20px] md:-left-[280px] md:top-[0px] md:h-[1200px] md:w-[1000px] md:blur-[30px]" viewBox="-400 -300 1200 1500" fill="none" style="mix-blend-mode: color-dodge;">
          <path d="M421.005 617C213.056 663.816 53.8207 774.769 -0.574961 638.942C-27.716 571.17 -2.88865 494.644 34.7934 432.116C348.815 -88.9527 699.286 -73.237 559.502 -116.5C411.516 -162.302 72.5884 263.275 -125.371 432.772C-323.331 602.27 -254.761 756.353 24.1935 929.004C303.148 1101.65 176.911 948.323 387.382 831.722C597.853 715.121 669.37 561.085 421.005 617Z" fill="url(#grad-left)"></path>
          <defs>
            <linearGradient id="grad-left" x1="193" y1="324.5" x2="153" y2="709.001" gradientUnits="userSpaceOnUse">
              <stop stop-color="#55DFC0"></stop>
              <stop offset="0.934" stop-color="#55DFC0"></stop>
            </linearGradient>
          </defs>
        </svg>

        <!-- Gradiente luminoso à direita -->
        <svg class="pointer-events-none absolute -right-[250px] -top-[250px] h-[600px] w-[600px] blur-[20px] md:-right-[280px] md:-top-[220px] md:h-[1200px] md:w-[1200px] md:blur-[30px]" viewBox="-200 -200 1100 1200" fill="none" style="mix-blend-mode: hard-light;">
          <path d="M438.04 129.445C588.74 334.63 442.58 250.74 181.612 379.818C100.749 491.816 89.7221 354.954 107.019 508.897C124.316 662.84 139.667 518.194 374.257 631.705C608.847 745.217 722.575 620.679 769.06 295.928C815.546 -28.8226 725.602 148.255 534.47 2.09573C343.339 -144.064 287.34 -75.7406 438.04 129.445Z" fill="url(#grad-right)"></path>
          <defs>
            <linearGradient id="grad-right" x1="403.5" y1="281" x2="100" y2="470.151" gradientUnits="userSpaceOnUse">
              <stop stop-color="#5c63f1"></stop>
              <stop offset="0.934" stop-color="#5B9AFF"></stop>
            </linearGradient>
          </defs>
        </svg>

        <div class="flex h-full flex-col items-center justify-start pb-[40px] pt-[40px] md:pb-[60px] md:pt-[100px] 2xl:pb-[80px] 2xl:pt-[140px]">
          <div class="relative z-10 mx-auto flex max-w-[860px] flex-col items-center gap-4 md:gap-6 2xl:max-w-[1000px] 2xl:gap-8 text-center">
            
            <!-- Usuários Badge -->
            <div class="flex items-center gap-2 rounded-full border border-[#5c63f1] bg-transparent py-2 pl-2 pr-4 2xl:py-2.5 2xl:pl-2.5 2xl:pr-5 shadow-lg shadow-[#5c63f1]/10">
              <div class="flex items-center -space-x-3.5">
                <img src="/images/avatar-1.png" alt="Usuário 1" class="h-9 w-9 md:h-10 md:w-10 rounded-full border-2 border-[#00001b] object-cover shadow-sm" />
                <img src="/images/avatar-2.png" alt="Usuário 2" class="h-9 w-9 md:h-10 md:w-10 rounded-full border-2 border-[#00001b] object-cover shadow-sm" />
                <img src="/images/avatar-3.png" alt="Usuário 3" class="h-9 w-9 md:h-10 md:w-10 rounded-full border-2 border-[#00001b] object-cover shadow-sm" />
                <img src="/images/avatar-4.png" alt="Usuário 4" class="h-9 w-9 md:h-10 md:w-10 rounded-full border-2 border-[#00001b] object-cover shadow-sm" />
              </div>
              <span class="ml-2 text-xs font-semibold leading-[1.2] tracking-[0.13px] text-white md:text-sm 2xl:text-base">+2.000 usuários ativos</span>
            </div>

            <div class="flex flex-col items-center gap-4 text-center md:gap-6 2xl:gap-8">
              <div class="flex flex-col items-center gap-1 tracking-[0.26px] text-white md:gap-4 2xl:gap-5">
                <h1 class="text-2xl font-normal leading-[1.3] sm:text-3xl md:text-[48px] 2xl:text-[56px]">Seu WhatsApp atendendo e vendendo.</h1>
                <h2 class="text-3xl font-black leading-[1.3] sm:text-4xl md:text-[60px] 2xl:text-[72px]">A IA do <span class="text-[#5c63f1]">Abravely Chat</span> faz o resto.</h2>
              </div>
              <p class="max-w-[660px] text-center text-sm leading-[1.4] tracking-[0.07px] text-[#afc8ff] sm:text-base sm:leading-[1.5] md:text-lg 2xl:max-w-[760px] 2xl:text-xl">
                <span class="text-white">Centralize seus canais de chat, automatize fluxos com agentes de IA humanizados e converta mais contatos </span>
                em clientes pagantes 24 horas por dia, de forma 100% autônoma e integrada aos seus sistemas favoritos.
              </p>
            </div>

            <button @click="$emit('go-to-login')" class="flex items-center gap-[7px] rounded-[10px] bg-[#5c63f1] px-6 py-3 transition-colors hover:bg-[#484fdf] md:px-[31px] md:py-4 2xl:px-9 2xl:py-5 cursor-pointer">
              <span class="text-center text-base font-normal leading-7 tracking-[-0.44px] text-white md:text-lg 2xl:text-xl">Experimentar Abravely Chat grátis</span>
              <svg class="h-5 w-5 text-white 2xl:h-6 2xl:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- IMAGEM DO DASHBOARD HERO -->
      <div class="relative pb-16 px-4 md:px-[112px] 2xl:px-[160px]">
        <div class="flex justify-center">
          <div class="w-[95%] max-w-[1100px] rounded-[16px] border border-[#5c63f1]/30 bg-[#0c0d12] shadow-[0_20px_80px_rgba(92,99,241,0.15),0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden md:rounded-[20px] 2xl:max-w-[1200px] 2xl:rounded-[24px]">
            <img 
              src="/images/hero-dashboard.png" 
              alt="Abravely Chat Dashboard — Painel de Relatórios" 
              class="w-full h-auto object-cover block"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- 4. SEÇÃO WHATSAPP AUTOMÁTICO (FUNDO BRANCO) -->
    <section id="whatsapp" class="relative z-10 scroll-mt-20 bg-white px-4 py-[80px] md:px-[112px] md:py-[124px] rounded-t-[28px] md:rounded-t-[40px] shadow-[0_-20px_60px_rgba(0,0,0,0.3)] text-[#101828]">
      <div class="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 sm:gap-12 md:flex-row md:items-start">
        
        <div class="flex w-full flex-col gap-3 text-center sm:text-left md:w-[480px] reveal active">
          <div class="mx-auto inline-flex w-fit items-center gap-2 rounded-full bg-green-100 px-3 py-2 sm:mx-0 sm:px-4 sm:py-2.5">
            <svg class="h-4 w-4 text-[#008236] sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span class="text-sm font-semibold tracking-[-0.3px] text-[#008236] sm:text-base">WhatsApp com IA</span>
          </div>
          <h2 class="text-2xl font-black leading-[1.2] tracking-[0.35px] text-[#101828] sm:text-3xl md:text-[38px]">
            Atendimento 100% humanizado e inteligente no WhatsApp.
          </h2>
          <p class="text-base font-bold leading-7 tracking-[-0.45px] text-[#101828] sm:text-lg md:text-xl">
            A IA conversa, qualifica e vende. Você colhe os resultados.
          </p>
          <p class="text-sm leading-6 tracking-[-0.44px] text-[#5f729c] sm:text-base sm:leading-7 md:text-lg">
            Utilize agentes de IA treinados com os dados da sua empresa para responder de forma realista, educada e instantânea a cada lead ou cliente que chega, resolvendo dúvidas e fechando vendas no piloto automático.
          </p>
        </div>

        <div class="flex w-full flex-col gap-4 sm:gap-6 md:w-[608px] md:gap-8 reveal active delay-100">
          <!-- Card 1 -->
          <div class="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:items-center sm:gap-4 sm:rounded-3xl sm:px-6 sm:py-5 md:px-8 md:py-6 shadow-sm hover:shadow-md transition-shadow text-left">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 sm:h-10 sm:w-10 sm:rounded-xl text-[#5c63f1]">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div class="flex flex-1 flex-col gap-1 sm:gap-2">
              <h3 class="text-base font-bold leading-6 tracking-[-0.45px] text-[#101828] sm:text-lg sm:leading-7 md:text-xl">
                IA treinada para o seu negócio
              </h3>
              <p class="text-xs leading-5 tracking-[-0.3px] text-[#5f729c] sm:text-sm sm:leading-6 md:text-base">
                Nossos agentes aprendem seus produtos, preços, FAQs e o tom de voz ideal para representar sua marca.
              </p>
            </div>
          </div>

          <!-- Card 2 -->
          <div class="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:items-center sm:gap-4 sm:rounded-3xl sm:px-6 sm:py-5 md:px-8 md:py-6 shadow-sm hover:shadow-md transition-shadow text-left">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 sm:h-10 sm:w-10 sm:rounded-xl text-[#5c63f1]">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div class="flex flex-1 flex-col gap-1 sm:gap-2">
              <h3 class="text-base font-bold leading-6 tracking-[-0.45px] text-[#101828] sm:text-lg sm:leading-7 md:text-xl">
                Disponibilidade 24/7 sem pausas
              </h3>
              <p class="text-xs leading-5 tracking-[-0.3px] text-[#5f729c] sm:text-sm sm:leading-6 md:text-base">
                Respostas imediatas em menos de 3 segundos. Nunca mais perca um lead à noite ou aos fins de semana.
              </p>
            </div>
          </div>

          <!-- Card 3 -->
          <div class="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:items-center sm:gap-4 sm:rounded-3xl sm:px-6 sm:py-5 md:px-8 md:py-6 shadow-sm hover:shadow-md transition-shadow text-left">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 sm:h-10 sm:w-10 sm:rounded-xl text-[#5c63f1]">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </div>
            <div class="flex flex-1 flex-col gap-1 sm:gap-2">
              <h3 class="text-base font-bold leading-6 tracking-[-0.45px] text-[#101828] sm:text-lg sm:leading-7 md:text-xl">
                Transbordo humano inteligente integrado
              </h3>
              <p class="text-xs leading-5 tracking-[-0.3px] text-[#5f729c] sm:text-sm sm:leading-6 md:text-base">
                A IA detecta quando o assunto exige atenção especializada e direciona o chat de forma limpa para o time humano.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- 5. SEÇÃO MODELOS DE IA CONECTADOS (CÍRCULO GIRATÓRIO) -->
    <section id="integracoes" class="scroll-mt-20 relative overflow-hidden bg-[#00001b] px-4 py-[80px] md:px-[112px] md:py-[124px]">
      <div class="absolute top-0 left-0 right-0 h-12 bg-white rounded-b-[40px] pointer-events-none" />
      
      <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 md:flex-row">
        
        <!-- Círculo de Órbita -->
        <div class="flex w-full justify-center md:w-1/2 reveal active">
          <div class="orbit-container">
            <!-- Teia Espiral SVG de Fundo -->
            <div class="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center overflow-hidden">
              <svg class="w-[110%] h-[110%] opacity-60 text-blue-500/20" viewBox="0 0 500 500" fill="none">
                <defs>
                  <radialGradient id="spiral-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#5c63f1" stop-opacity="0.45" />
                    <stop offset="60%" stop-color="#5c63f1" stop-opacity="0.12" />
                    <stop offset="100%" stop-color="#5c63f1" stop-opacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="250" cy="250" r="220" fill="url(#spiral-glow)" />
                <circle cx="250" cy="250" r="50" stroke="rgba(92, 99, 241, 0.24)" stroke-width="1" />
                <circle cx="250" cy="250" r="90" stroke="rgba(92, 99, 241, 0.20)" stroke-width="1" />
                <circle cx="250" cy="250" r="130" stroke="rgba(92, 99, 241, 0.16)" stroke-width="1" />
                <circle cx="250" cy="250" r="170" stroke="rgba(92, 99, 241, 0.12)" stroke-width="1" />
                <circle cx="250" cy="250" r="210" stroke="rgba(92, 99, 241, 0.08)" stroke-width="1" />
                <circle cx="250" cy="250" r="250" stroke="rgba(92, 99, 241, 0.05)" stroke-width="1" />
                
                <g v-for="i in 16" :key="`cw-${i}`">
                  <path d="M 250 250 C 300 210, 320 130, 250 30" stroke="rgba(92, 99, 241, 0.26)" stroke-width="1.2" :transform="`rotate(${(i - 1) * 22.5} 250 250)`" />
                  <path d="M 250 250 C 300 210, 320 130, 250 30" stroke="#38bdf8" stroke-width="1.6" class="pulse-wire" :style="{ animationDelay: `${((i - 1) * 0.45) % 4}s` }" :transform="`rotate(${(i - 1) * 22.5} 250 250)`" />
                </g>
                <g v-for="i in 16" :key="`ccw-${i}`">
                  <path d="M 250 250 C 200 210, 180 130, 250 30" stroke="rgba(92, 99, 241, 0.26)" stroke-width="1.2" :transform="`rotate(${(i - 1) * 22.5} 250 250)`" />
                  <path d="M 250 250 C 200 210, 180 130, 250 30" stroke="#38bdf8" stroke-width="1.6" class="pulse-wire-reverse" :style="{ animationDelay: `${(((i - 1) * 0.45) + 0.9) % 4}s` }" :transform="`rotate(${(i - 1) * 22.5} 250 250)`" />
                </g>
              </svg>
            </div>

            <!-- Logo Central -->
            <div class="orbit-center">
              <img src="/images/abravely-logo-novo.png" alt="Abravely" class="h-full w-full object-contain" />
            </div>

            <!-- Itens de Órbita -->
            <div 
              v-for="(logo, idx) in integrationLogos" 
              :key="idx" 
              class="orbit-item" 
              :style="{ '--angle': `${(idx * 360) / integrationLogos.length}deg` }"
            >
              <div class="orbit-item-inner" :style="{ animationDelay: `${idx * 0.35}s` }">
                <img 
                  :src="logo.src" 
                  :alt="logo.name" 
                  :class="['h-9 w-9 md:h-14 md:w-14 object-contain', logo.invert ? 'brightness-0 invert' : '']" 
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Texto Descritivo -->
        <div class="flex w-full flex-col gap-4 text-center sm:text-left md:w-1/2 reveal active delay-200">
          <div class="mx-auto inline-flex w-fit items-center gap-2 rounded-full bg-blue-950/50 border border-blue-500/30 px-4 py-2 sm:mx-0">
            <span class="text-sm font-semibold tracking-[-0.3px] text-[#93c5fd]">Integração Total</span>
          </div>
          <h2 class="text-2xl font-black leading-[1.2] tracking-[0.35px] text-white sm:text-3xl md:text-[38px]">
            Seus canais de chat, inteligências artificiais e ferramentas integrados.
          </h2>
          <p class="text-sm leading-6 tracking-[-0.44px] text-[#afc8ff] sm:text-base sm:leading-7 md:text-lg">
            Una o WhatsApp e outros canais de comunicação aos modelos de IA mais avançados do mercado (como Claude, OpenAI e Gemini). Controle o fluxo de dados enviando informações automaticamente para suas ferramentas do dia a dia, como Google Sheets e Google Drive.
          </p>
          <p class="text-sm leading-6 tracking-[-0.44px] text-[#5f729c] sm:text-base sm:leading-7 md:text-lg">
            Crie fluxos de trabalho verdadeiramente automatizados em que cada conversa atualiza planilhas, registra leads no seu CRM e consulta arquivos internos de forma 100% autônoma.
          </p>
        </div>
      </div>
    </section>

    <!-- 6. SEÇÃO DE PLANOS E VALORES -->
    <section id="precos" class="scroll-mt-20 bg-[#00001b] px-4 py-[80px] md:px-[112px] md:py-[124px] border-t border-white/5 relative overflow-hidden">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div class="mx-auto max-w-7xl relative z-10">
        <div class="text-center mb-16">
          <div class="mx-auto inline-flex items-center gap-2 rounded-full bg-blue-950 border border-blue-500/30 px-4 py-2 mb-4 reveal active">
            <span class="text-sm font-semibold text-[#93c5fd]">Planos & Preços</span>
          </div>
          <h2 class="text-3xl font-black leading-[1.2] text-white sm:text-4xl md:text-[42px] reveal active delay-100">
            Escolha o plano ideal para o seu negócio
          </h2>
          <p class="mx-auto mt-4 max-w-[600px] text-sm leading-6 text-[#afc8ff] sm:text-base reveal active delay-200">
            Automatize seu atendimento e impulsione suas conversas no WhatsApp com inteligência artificial de ponta.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-8 md:grid-cols-3 items-stretch max-w-6xl mx-auto">
          <!-- Plano 1: Starter -->
          <div class="flex flex-col p-10 rounded-[28px] bg-[#0c0d1b] border border-white/5 hover:border-white/10 transition-all text-left reveal active">
            <div class="mb-6">
              <h3 class="text-base font-bold text-blue-400 uppercase tracking-wider mb-3">Starter</h3>
              <div class="text-4xl font-black text-white mb-3">R$ 149<span class="text-sm text-[#5f729c] font-normal">/mês</span></div>
              <p class="text-sm text-[#5f729c] leading-relaxed">Essencial para automatizar seu atendimento inicial.</p>
            </div>
            <div class="h-[1px] w-full bg-white/5 my-4" />
            <ul class="flex flex-col gap-4 mb-8 text-sm text-[#afc8ff] flex-1">
              <li class="flex items-center gap-3">
                <div class="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-blue-500/30 text-blue-400 bg-blue-500/5">
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span>1 Número de WhatsApp</span>
              </li>
              <li class="flex items-center gap-3">
                <div class="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-blue-500/30 text-blue-400 bg-blue-500/5">
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span>1.000 conversas qualificadas/mês</span>
              </li>
              <li class="flex items-center gap-3">
                <div class="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-blue-500/30 text-blue-400 bg-blue-500/5">
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span>Agente IA Básico (GPT-4o-mini)</span>
              </li>
              <li class="flex items-center gap-3">
                <div class="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-blue-500/30 text-blue-400 bg-blue-500/5">
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span>Atendimento Humano + IA</span>
              </li>
            </ul>
            <button @click="$emit('go-to-login')" class="w-full text-center rounded-xl bg-[#5c63f1] hover:bg-[#484fdf] py-4 text-base font-bold text-white transition-all cursor-pointer">
              Começar Agora
            </button>
          </div>

          <!-- Plano 2: Pro (Destaque) -->
          <div class="flex flex-col p-10 rounded-[28px] bg-[#0c0e25] border border-[#5c63f1]/40 relative shadow-[0_0_40px_rgba(92,99,241,0.15)] text-left reveal active delay-100">
            <div class="mb-6 flex justify-between items-start">
              <div>
                <h3 class="text-base font-bold text-white uppercase tracking-wider mb-3">Pro</h3>
                <div class="text-4xl font-black text-white mb-3">R$ 349<span class="text-sm text-[#5f729c] font-normal">/mês</span></div>
                <p class="text-sm text-[#5f729c] leading-relaxed">Perfeito para empresas em crescimento constante.</p>
              </div>
              <div class="flex items-center gap-1 bg-[#5c63f1]/10 border border-[#5c63f1]/30 text-[#93c5fd] text-[10px] font-bold px-2.5 py-1 rounded-full">
                <span>Popular</span>
              </div>
            </div>
            <div class="h-[1px] w-full bg-white/5 my-4" />
            <ul class="flex flex-col gap-4 mb-8 text-sm text-[#afc8ff] flex-1">
              <li class="flex items-center gap-3">
                <div class="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-blue-500/30 text-blue-400 bg-blue-500/5">
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span class="font-bold text-white">2 Números de WhatsApp</span>
              </li>
              <li class="flex items-center gap-3">
                <div class="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-blue-500/30 text-blue-400 bg-blue-500/5">
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span class="font-bold text-white">5.000 conversas qualificadas/mês</span>
              </li>
              <li class="flex items-center gap-3">
                <div class="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-blue-500/30 text-blue-400 bg-blue-500/5">
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span>IA Avançada (Claude 3.5 & GPT-4o)</span>
              </li>
              <li class="flex items-center gap-3">
                <div class="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-blue-500/30 text-blue-400 bg-blue-500/5">
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span>Disparos em Massa</span>
              </li>
            </ul>
            <button @click="$emit('go-to-login')" class="w-full text-center rounded-xl bg-[#5c63f1] hover:bg-[#484fdf] py-4 text-base font-bold text-white transition-all cursor-pointer">
              Assinar Plano Pro
            </button>
          </div>

          <!-- Plano 3: Enterprise -->
          <div class="flex flex-col p-10 rounded-[28px] bg-[#0c0d1b] border border-white/5 hover:border-white/10 transition-all text-left reveal active delay-200">
            <div class="mb-6">
              <h3 class="text-base font-bold text-blue-400 uppercase tracking-wider mb-3">Enterprise</h3>
              <div class="text-4xl font-black text-white mb-3">Personalizado</div>
              <p class="text-sm text-[#5f729c] leading-relaxed">Sob medida para grandes volumes e corporações.</p>
            </div>
            <div class="h-[1px] w-full bg-white/5 my-4" />
            <ul class="flex flex-col gap-4 mb-8 text-sm text-[#afc8ff] flex-1">
              <li class="flex items-center gap-3">
                <div class="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-blue-500/30 text-blue-400 bg-blue-500/5">
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span>5+ Números de WhatsApp</span>
              </li>
              <li class="flex items-center gap-3">
                <div class="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-blue-500/30 text-blue-400 bg-blue-500/5">
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span>20.000 conversas qualificadas/mês</span>
              </li>
            </ul>
            <button @click="$emit('go-to-login')" class="w-full text-center rounded-xl bg-white hover:bg-gray-100 py-4 text-base font-bold text-[#00001b] transition-all cursor-pointer">
              Falar com Vendas
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 7. MARQUEE HORIZONTAL DE PLATAFORMAS -->
    <section class="relative overflow-hidden bg-[#00001b] px-4 py-[80px] md:px-[112px] md:py-[100px]">
      <div class="mx-auto max-w-4xl text-center mb-14">
        <h2 class="text-xl font-black leading-[1.2] text-white sm:text-2xl md:text-[38px] reveal active">
          Conecte-se às principais plataformas do mercado.
        </h2>
        <p class="mx-auto mt-4 max-w-[680px] text-sm leading-6 text-[#afc8ff] sm:text-base reveal active delay-100">
          O Abravely Chat se integra com as ferramentas mais utilizadas para escalar seu negócio: CRMs, ERPs, planilhas, gateways de pagamento e muito mais.
        </p>
      </div>

      <div class="relative py-8 flex flex-col gap-6 md:gap-8 items-center justify-center overflow-hidden">
        <div class="absolute inset-0 w-full h-full pointer-events-none z-20 marquee-fade-overlay" />

        <!-- Fileira 1 (Esquerda) -->
        <div class="marquee-container-custom w-full">
          <div class="marquee-content-custom flex items-center">
            <div v-for="(logo, idx) in marqueeLogos" :key="`r1-${idx}`" class="flex items-center justify-center bg-[#080816] border border-white/5 rounded-[20px] md:rounded-[28px] h-20 w-20 md:h-28 md:w-28 shrink-0 mr-6">
              <img :src="logo.src" :alt="logo.name" :class="['h-11 w-11 md:h-16 md:w-16 object-contain', logo.invert ? 'brightness-0 invert' : '']" />
            </div>
          </div>
        </div>

        <!-- Fileira 2 (Direita) -->
        <div class="marquee-container-custom w-full">
          <div class="marquee-content-custom-reverse flex items-center">
            <div v-for="(logo, idx) in marqueeLogosReverse" :key="`r2-${idx}`" class="flex items-center justify-center bg-[#080816] border border-white/5 rounded-[20px] md:rounded-[28px] h-20 w-20 md:h-28 md:w-28 shrink-0 mr-6">
              <img :src="logo.src" :alt="logo.name" :class="['h-11 w-11 md:h-16 md:w-16 object-contain', logo.invert ? 'brightness-0 invert' : '']" />
            </div>
          </div>
        </div>

        <!-- Destaque Central -->
        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex h-32 w-32 md:h-48 md:w-48 items-center justify-center">
          <img src="/images/abravely-logo-novo.png" alt="Abravely" class="h-full w-full object-contain" />
        </div>
      </div>
    </section>

    <!-- 8. FOOTER -->
    <footer class="bg-[#03030b] border-t border-white/10 px-4 py-[80px] md:px-[112px] relative overflow-hidden">
      <div class="mx-auto max-w-7xl flex flex-col justify-between gap-12 lg:flex-row border-b border-white/5 pb-14">
        <div class="flex flex-col gap-4 text-left lg:w-1/4">
          <a class="flex items-center gap-2" href="#">
            <img src="/images/abravely-logo-novo.png" alt="Abravely" class="h-8 w-8 object-contain" />
            <span class="text-lg font-black tracking-[-0.3px] text-white">Abravely Chat</span>
          </a>
          <p class="text-sm text-[#5f729c] leading-6 max-w-[300px]">
            Atendimento e vendas inteligentes por IA integrados ao seu WhatsApp.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:w-3/4 text-left">
          <div class="flex flex-col gap-3">
            <h4 class="text-xs font-bold uppercase text-white tracking-widest">Produto</h4>
            <a href="#whatsapp" class="text-sm text-[#5f729c] hover:text-white transition-colors">WhatsApp IA</a>
            <a href="#integracoes" class="text-sm text-[#5f729c] hover:text-white transition-colors">Integrações</a>
            <a href="#precos" class="text-sm text-[#5f729c] hover:text-white transition-colors">Preços</a>
          </div>

          <div class="flex flex-col gap-3">
            <h4 class="text-xs font-bold uppercase text-white tracking-widest">Atalhos</h4>
            <button @click="$emit('go-to-login')" class="text-sm text-[#5f729c] hover:text-white transition-colors text-left cursor-pointer">Entrar no Painel</button>
          </div>

          <div class="flex flex-col gap-3">
            <h4 class="text-xs font-bold uppercase text-white tracking-widest">Fale conosco</h4>
            <span class="text-sm text-[#5f729c]">suporte@abravelychat.com</span>
          </div>
        </div>
      </div>

      <div class="mx-auto max-w-7xl pt-8 text-center text-xs text-[#5f729c]">
        <span>© 2026 Abravely Chat — Todos os direitos reservados.</span>
      </div>
    </footer>

  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineEmits(['go-to-login', 'go-to-register']);

const mobileMenuOpen = ref(false);

const integrationLogos = [
  { name: 'Claude', src: '/images/integrations/claude.png' },
  { name: 'Gemini', src: '/images/integrations/gemini.png' },
  { name: 'DeepSeek', src: '/images/integrations/deepseek.png' },
  { name: 'MiniMax', src: '/images/integrations/minimax.png' },
  { name: 'OpenAI', src: '/images/integrations/openai.png', invert: true },
  { name: 'Moonshot', src: '/images/integrations/moonshot.png' },
  { name: 'Google Sheets', src: '/images/integrations/sheets.png' },
  { name: 'Google Drive', src: '/images/integrations/drive.png' },
  { name: 'WhatsApp', src: '/images/integrations/whatsapp.webp' },
  { name: 'CRM', src: '/images/integrations/custom.png' }
];

const marqueeLogos = [...integrationLogos, ...integrationLogos, ...integrationLogos];
const marqueeLogosReverse = [...integrationLogos].reverse().concat([...integrationLogos].reverse()).concat([...integrationLogos].reverse());

function handleLogoError(e: Event) {
  const target = e.target as HTMLImageElement;
  if (target) {
    target.src = '/logo.png';
  }
}
</script>
