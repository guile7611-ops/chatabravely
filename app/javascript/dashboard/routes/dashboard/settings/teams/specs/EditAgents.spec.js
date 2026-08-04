import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createI18n } from 'vue-i18n';
import EditAgents from '../Edit/EditAgents.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'pt_BR',
  missing: (_locale, key) => key,
  messages: { pt_BR: {} },
});

vi.mock('../../SettingsSubPageHeader.vue', () => ({
  default: {
    name: 'PageHeader',
    props: ['headerTitle', 'headerContent'],
    template: '<div>{{ headerTitle }}</div>',
  },
}));

vi.mock('../AgentSelector.vue', () => ({
  default: {
    name: 'AgentSelector',
    props: ['agentList', 'selectedAgents', 'updateSelectedAgents', 'isWorking', 'submitButtonText'],
    template: `
      <div class="agent-selector">
        <button class="submit-btn" :disabled="isWorking" @click="$emit('submit')">
          {{ submitButtonText }}
        </button>
      </div>
    `,
  },
}));

vi.mock('dashboard/components-next/button/Button.vue', () => ({
  default: {
    name: 'Button',
    props: ['label', 'disabled'],
    emits: ['click'],
    template: '<button class="retry-btn" :disabled="disabled" @click="$emit(\'click\')">{{ label }}</button>',
  },
}));

vi.mock('dashboard/components-next/spinner/Spinner.vue', () => ({
  default: { name: 'Spinner', template: '<div class="spinner" />' },
}));

const mockDispatch = vi.fn();
const mockRoute = { params: { teamId: 1 } };

const createWrapper = ({
  agents = [{ id: 1, name: 'Agent 1' }],
  teamMembers = [{ id: 1, name: 'Agent 1' }],
  isFetching = false,
  isUpdating = false,
  error = null,
}) => {
  mockDispatch.mockImplementation((action) => {
    if (action === 'teamMembers/get') {
      return error ? Promise.reject(new Error(error)) : Promise.resolve();
    }
    return Promise.resolve();
  });

  const mockStore = {
    dispatch: mockDispatch,
    getters: {
      'agents/getAgents': agents,
      'teamMembers/getTeamMembers': () => teamMembers,
      'teamMembers/getUIFlags': { isFetching, isCreating: false, isUpdating, isDeleting: false },
      'teamMembers/getError': error,
      'teams/getTeam': () => ({ id: 1, name: 'Support Team' }),
      getCurrentRole: 'administrator',
      getCurrentUserID: 1,
    },
  };

  return mount(EditAgents, {
    global: {
      plugins: [i18n],
      config: {
        globalProperties: {
          $store: mockStore,
          $route: mockRoute,
        },
      },
      directives: {
        tooltip: () => {},
      },
      stubs: {
        RouterLink: true,
      },
      mocks: {
        $t: key => key,
        $route: mockRoute,
        $store: mockStore,
      },
    },
  });
};

describe('EditAgents.vue', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  it('fetches members on mount and renders agent selector', async () => {
    const wrapper = createWrapper({ error: null });
    expect(mockDispatch).toHaveBeenCalledWith('agents/get');
    expect(mockDispatch).toHaveBeenCalledWith('teamMembers/get', { teamId: 1 });
    expect(wrapper.find('.agent-selector').exists()).toBe(true);
  });

  it('renders error banner and retry button on fetch failure', () => {
    const wrapper = createWrapper({ error: 'Erro ao carregar membros do time' });
    expect(wrapper.text()).toContain('Erro ao carregar membros do time');
    const retryBtn = wrapper.find('.retry-btn');
    expect(retryBtn.exists()).toBe(true);
  });

  it('disables submit button during isUpdating state', () => {
    const wrapper = createWrapper({ isUpdating: true, error: null });
    const submitBtn = wrapper.find('.submit-btn');
    expect(submitBtn.attributes('disabled')).toBeDefined();
  });

  it('retry button triggers fetchMembers', async () => {
    const wrapper = createWrapper({ error: 'Erro ao carregar membros do time' });
    mockDispatch.mockClear();
    const retryBtn = wrapper.find('.retry-btn');
    await retryBtn.trigger('click');
    expect(mockDispatch).toHaveBeenCalledWith('teamMembers/get', { teamId: 1 });
  });
});
