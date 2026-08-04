import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createI18n } from 'vue-i18n';
import Index from '../Index.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'pt_BR',
  missing: (_locale, key) => key,
  messages: { pt_BR: {} },
});

vi.mock('../AddCanned.vue', () => ({
  default: { name: 'AddCanned', template: '<div class="add-canned" />' },
}));
vi.mock('../EditCanned.vue', () => ({
  default: { name: 'EditCanned', template: '<div class="edit-canned" />' },
}));
vi.mock('../../components/BaseSettingsHeader.vue', () => ({
  default: { name: 'BaseSettingsHeader', template: '<div class="header" />' },
}));
vi.mock('../../SettingsLayout.vue', () => ({
  default: {
    name: 'SettingsLayout',
    props: ['isLoading', 'noRecordsFound'],
    template: '<div><slot name="header" /><slot name="body" /><slot /></div>',
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
vi.mock('dashboard/components-next/icon/Icon.vue', () => ({
  default: { name: 'Icon', template: '<span class="icon" />' },
}));
vi.mock('dashboard/components-next/table', () => ({
  BaseTable: { name: 'BaseTable', template: '<div class="base-table"><slot name="header-0" /><slot name="header-1" /><slot name="row" :items="items" /></div>', props: ['items'] },
  BaseTableRow: { name: 'BaseTableRow', template: '<div class="base-table-row"><slot /></div>' },
  BaseTableCell: { name: 'BaseTableCell', template: '<div class="base-table-cell"><slot /></div>' },
}));
vi.mock('shared/composables/useMessageFormatter', () => ({
  useMessageFormatter: () => ({
    getPlainText: text => text,
  }),
}));

const mockDispatch = vi.fn();

const createWrapper = ({
  canned = [],
  fetchingList = false,
  error = null,
}) => {
  const mockStore = {
    dispatch: mockDispatch,
    getters: {
      getSortedCannedResponses: () => canned,
      getUIFlags: { fetchingList, creatingItem: false, updatingItem: false, deletingItem: false },
      getError: error,
      getCurrentRole: 'administrator',
      getCurrentUserID: 1,
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
        WootModal: true,
        WootDeleteModal: true,
      },
      mocks: {
        $t: key => key,
        $store: mockStore,
      },
    },
  });
};

describe('canned/Index.vue', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  it('dispatches getCannedResponse on mount', () => {
    createWrapper({});
    expect(mockDispatch).toHaveBeenCalledWith('getCannedResponse');
  });

  it('renders table when canned responses exist', () => {
    const wrapper = createWrapper({
      canned: [{ id: 1, short_code: 'hi', content: 'Hello {{contact.name}}' }],
    });
    expect(wrapper.find('.base-table').exists()).toBe(true);
    expect(wrapper.text()).toContain('hi');
    expect(wrapper.text()).toContain('Hello {{contact.name}}');
  });

  it('renders error banner and retry button on error', async () => {
    const wrapper = createWrapper({ error: 'Erro ao carregar respostas rápidas' });
    expect(wrapper.text()).toContain('Erro ao carregar respostas rápidas');
    const retryBtn = wrapper.find('.retry-btn');
    expect(retryBtn.exists()).toBe(true);

    await retryBtn.trigger('click');
    expect(mockDispatch).toHaveBeenCalledWith('getCannedResponse');
  });

  it('disables retry button during fetchingList', () => {
    const wrapper = createWrapper({ error: 'Erro ao carregar', fetchingList: true });
    const retryBtn = wrapper.find('.retry-btn');
    expect(retryBtn.attributes('disabled')).toBeDefined();
  });
});
