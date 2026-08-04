import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import Index from '../Index.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'pt_BR',
  missing: (_locale, key) => key,
  messages: { pt_BR: {} },
});

// Mock components used in Index.vue
vi.mock('../SettingsLayout.vue', () => ({
  default: {
    name: 'SettingsLayout',
    props: ['isLoading', 'loadingMessage', 'noRecordsFound', 'noRecordsMessage'],
    template: `
      <div class="settings-layout" :data-no-records="noRecordsFound">
        <slot name="header" />
        <slot name="body" />
      </div>
    `,
  },
}));

vi.mock('../components/BaseSettingsHeader.vue', () => ({
  default: {
    name: 'BaseSettingsHeader',
    template: '<div><slot name="count" /><slot name="actions" /></div>',
  },
}));

vi.mock('dashboard/components-next/button/Button.vue', () => ({
  default: {
    name: 'Button',
    props: ['label', 'disabled'],
    emits: ['click'],
    template: '<button :disabled="disabled" @click="$emit(\'click\')">{{ label }}</button>',
  },
}));

vi.mock('next/avatar/Avatar.vue', () => ({
  default: { name: 'Avatar', template: '<div />' },
}));

const mockDispatch = vi.fn();

const createWrapper = ({ agents = [], isFetching = false, error = null }) => {
  const mockStore = {
    dispatch: mockDispatch,
    getters: {
      'agents/getAgents': agents,
      'agents/getAgentsError': error,
      'agents/getUIFlags': { isFetching },
      getCurrentUserID: 1,
      'customRole/getCustomRoles': [],
      'globalConfig/isACustomBrandedInstance': false,
      'globalConfig/isOnChatwootCloud': false,
      'accounts/isFeatureEnabledonAccount': () => true,
    },
  };

  return mount(Index, {
    global: {
      plugins: [i18n],
      config: {
        globalProperties: {
          $store: mockStore,
        },
      },
      directives: {
        tooltip: () => {},
      },
      stubs: {
        AddAgent: true,
        EditAgent: true,
        WootModal: true,
        WootDeleteModal: true,
        WootLoadingState: true,
      },
      mocks: {
        $t: key => key,
        $store: mockStore,
      },
    },
  });
};

describe('agents/Index.vue', () => {
  it('renders empty state when list is empty and no error occurs', () => {
    const wrapper = createWrapper({ agents: [], isFetching: false, error: null });
    const layout = wrapper.findComponent({ name: 'SettingsLayout' });
    expect(layout.props('noRecordsFound')).toBe(true);
    expect(wrapper.text()).not.toContain('Erro ao carregar atendentes');
  });

  it('renders error state on failure', () => {
    const wrapper = createWrapper({
      agents: [],
      isFetching: false,
      error: 'Falha de conexão com a API',
    });
    expect(wrapper.text()).toContain('Erro ao carregar atendentes');
    expect(wrapper.text()).toContain('Falha de conexão com a API');
    expect(wrapper.text()).toContain('Tentar novamente');
  });

  it('triggers agents/get when clicking "Tentar novamente"', async () => {
    mockDispatch.mockClear();
    const wrapper = createWrapper({
      agents: [],
      isFetching: false,
      error: 'Falha de conexão com a API',
    });
    const retryBtn = wrapper.findAll('button').find(b => b.text().includes('Tentar novamente'));
    expect(retryBtn.exists()).toBe(true);
    await retryBtn.trigger('click');
    expect(mockDispatch).toHaveBeenCalledWith('agents/get');
  });
});
