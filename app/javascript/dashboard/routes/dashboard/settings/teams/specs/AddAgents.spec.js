import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createI18n } from 'vue-i18n';
import AddAgents from '../Create/AddAgents.vue';
import router from '../../../../index';

vi.mock('../../../../index', () => ({
  default: {
    replace: vi.fn(),
  },
}));

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

const mockDispatch = vi.fn();
const mockRoute = { params: { teamId: 1 } };

const createWrapper = ({
  agents = [{ id: 1, name: 'Agent 1' }],
  isCreating = false,
  error = null,
  shouldFailCreate = false,
}) => {
  mockDispatch.mockImplementation((action) => {
    if (action === 'teamMembers/create') {
      return shouldFailCreate
        ? Promise.reject(new Error('Erro ao adicionar membros ao time'))
        : Promise.resolve();
    }
    return Promise.resolve();
  });

  const mockStore = {
    dispatch: mockDispatch,
    getters: {
      'agents/getAgents': agents,
      'teamMembers/getUIFlags': { isFetching: false, isCreating, isUpdating: false, isDeleting: false },
      'teamMembers/getError': error,
      'teams/getTeam': () => ({ id: 1, name: 'Support Team' }),
      getCurrentRole: 'administrator',
      getCurrentUserID: 1,
    },
  };

  return mount(AddAgents, {
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

describe('AddAgents.vue', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    vi.clearAllMocks();
  });

  it('renders real error message when memberError exists', () => {
    const wrapper = createWrapper({ error: 'Erro ao adicionar membros ao time' });
    expect(wrapper.text()).toContain('Erro ao adicionar membros ao time');
  });

  it('retry button triggers addAgents operation again', async () => {
    const wrapper = createWrapper({ error: 'Erro ao adicionar membros ao time' });
    mockDispatch.mockClear();
    const retryBtn = wrapper.find('.retry-btn');
    expect(retryBtn.exists()).toBe(true);
    await retryBtn.trigger('click');
    expect(mockDispatch).toHaveBeenCalledWith('teamMembers/create', expect.any(Object));
  });

  it('disables buttons while isCreating is true', () => {
    const wrapper = createWrapper({ isCreating: true });
    const submitBtn = wrapper.find('.submit-btn');
    expect(submitBtn.attributes('disabled')).toBeDefined();
  });

  it('does NOT navigate/redirect on API failure', async () => {
    const wrapper = createWrapper({ shouldFailCreate: true });
    wrapper.vm.selectedAgents = [1];
    await wrapper.vm.addAgents();

    expect(mockDispatch).toHaveBeenCalledWith('teamMembers/create', {
      teamId: 1,
      agentsList: [1],
    });
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('navigates only after API confirmation on success', async () => {
    const wrapper = createWrapper({ shouldFailCreate: false });
    wrapper.vm.selectedAgents = [1];
    await wrapper.vm.addAgents();

    expect(mockDispatch).toHaveBeenCalledWith('teamMembers/create', {
      teamId: 1,
      agentsList: [1],
    });
    expect(router.replace).toHaveBeenCalledWith({
      name: 'settings_teams_finish',
      params: { page: 'new', teamId: 1 },
    });
  });
});
