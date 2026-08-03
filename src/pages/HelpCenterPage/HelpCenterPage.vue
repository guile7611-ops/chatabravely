<script setup lang="ts">
import { ref, computed } from 'vue'
import PageHeader from '../../layouts/PageHeader.vue'
import DataTable from '../../shared/ui/DataTable/DataTable.vue'
import SearchField from '../../shared/ui/SearchField/SearchField.vue'
import Button from '../../shared/ui/Button/Button.vue'
import Drawer from '../../shared/ui/Drawer/Drawer.vue'
import TextField from '../../shared/ui/TextField/TextField.vue'
import Textarea from '../../shared/ui/Textarea/Textarea.vue'
import Toast from '../../shared/ui/Toast/Toast.vue'
import { MOCK_HELP_ARTICLES } from '../../mocks/fixtures/helpArticles.fixture'

const searchQuery = ref('')
const showDrawer = ref(false)
const showToast = ref(false)
const newTitle = ref('')
const newContent = ref('')

const articlesList = ref([...MOCK_HELP_ARTICLES])

const columns = [
  { key: 'title', label: 'Título do Artigo' },
  { key: 'category', label: 'Categoria' },
  { key: 'views', label: 'Visualizações', align: 'center' as const },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Criado em' }
]

const filteredArticles = computed(() => {
  if (!searchQuery.value) return articlesList.value
  const q = searchQuery.value.toLowerCase()
  return articlesList.value.filter(a => 
    a.title.toLowerCase().includes(q) || 
    a.category.toLowerCase().includes(q)
  )
})

function handleSaveArticle() {
  if (!newTitle.value) return
  articlesList.value.push({
    id: `art-${Date.now()}`,
    title: newTitle.value,
    category: 'Geral',
    content: newContent.value,
    views: 0,
    status: 'Publicado',
    createdAt: 'Hoje'
  })
  showDrawer.value = false
  newTitle.value = ''
  newContent.value = ''
  showToast.value = true
}
</script>

<template>
  <div class="space-y-4 w-full">
    <PageHeader title="Central de Ajuda" description="Base de conhecimento interna para treinamento e suporte ao cliente (Tela Cheia).">
      <template #actions>
        <Button variant="primary" size="sm" @click="showDrawer = true">
          + Criar Novo Artigo
        </Button>
      </template>
    </PageHeader>

    <div class="w-80">
      <SearchField v-model="searchQuery" placeholder="Pesquisar por palavras-chave..." />
    </div>

    <!-- Tabela em Tela Cheia -->
    <DataTable :columns="columns" :items="filteredArticles">
      <template #cell(title)="{ item }">
        <span class="font-semibold text-[var(--action-primary)] hover:underline cursor-pointer">
          {{ item.title }}
        </span>
      </template>

      <template #cell(views)="{ item }">
        <span class="font-mono text-xs">{{ item.views }}</span>
      </template>
    </DataTable>

    <!-- Drawer de Cadastro -->
    <Drawer :open="showDrawer" title="Cadastrar Novo Artigo de Ajuda" width="md" @close="showDrawer = false">
      <div class="space-y-3 text-left">
        <TextField v-model="newTitle" label="Título do Artigo" placeholder="Ex: Como configurar o canal Meta" required />
        <Textarea v-model="newContent" label="Conteúdo do Artigo" placeholder="Escreva o texto explicativo..." :rows="5" />
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" @click="showDrawer = false">Cancelar</Button>
          <Button variant="primary" size="sm" @click="handleSaveArticle">Salvar Artigo</Button>
        </div>
      </template>
    </Drawer>

    <Toast :open="showToast" message="Artigo cadastrado localmente nas fixtures!" @close="showToast = false" />
  </div>
</template>
