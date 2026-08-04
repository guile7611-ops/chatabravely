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

vi.mock('dashboard/components-next/icon/Icon.vue', () => ({
  default: { name: 'Icon', template: '<div />' },
}));

vi.mock('dashboard/components-next/emoji-icon-picker/EmojiIcon.vue', () => ({
  default: { name: 'EmojiIcon', template: '<div />' },
}));

const mockDispatch = vi.fn();

const createWrapper = ({ teams = [], isFetching = false, error = null }) => {
  const mockStore = {
    dispatch: mockDispatch,
    getters: {
      'teams/getTeams': teams,
      'teams/getTeamsError': error,
      'teams/getUIFlags': { isFetching, isCreating: false, isUpdating: false, isDeleting: false },
      getCurrentRole: 'administrator',
      getCurrentUserID: 1,
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
        RouterLink: true,
        WootConfirmDeleteModal: true,
        WootLoadingState: true,
      },
      mocks: {
        $t: key => key,
        $store: mockStore,
      },
    },
  });
};

describe('teams/Index.vue', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  it('renders empty state when list is empty and no error occurs', () => {
    const wrapper = createWrapper({ teams: [], isFetching: false, error: null });
    const layout = wrapper.findComponent({ name: 'SettingsLayout' });
    expect(layout.props('noRecordsFound')).toBe(true);
    expect(wrapper.text()).not.toContain('Erro ao carregar departamentos');
  });

  it('renders error state on failure', () => {
    const wrapper = createWrapper({
      teams: [],
      isFetching: false,
      error: 'Erro ao carregar departamentos',
    });
    const layout = wrapper.findComponent({ name: 'SettingsLayout' });
    expect(layout.props('noRecordsFound')).toBe(false);
    expect(wrapper.text()).toContain('Erro ao carregar departamentos');
  });

  it('retry button triggers teams/get action', async () => {
    const wrapper = createWrapper({
      teams: [],
      isFetching: false,
      error: 'Erro ao carregar departamentos',
    });
    const retryBtn = wrapper.find('button');
    expect(retryBtn.exists()).toBe(true);
    await retryBtn.trigger('click');
    expect(mockDispatch).toHaveBeenCalledWith('teams/get');
  });
});
