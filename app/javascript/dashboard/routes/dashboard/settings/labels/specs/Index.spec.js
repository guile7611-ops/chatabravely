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

vi.mock('../AddLabel.vue', () => ({
  default: { name: 'AddLabel', template: '<div class="add-label" />' },
}));
vi.mock('../EditLabel.vue', () => ({
  default: { name: 'EditLabel', template: '<div class="edit-label" />' },
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
vi.mock('dashboard/components-next/table', () => ({
  BaseTable: { name: 'BaseTable', template: '<div class="base-table"><slot name="row" :items="items" /></div>', props: ['items'] },
  BaseTableRow: { name: 'BaseTableRow', template: '<div class="base-table-row"><slot /></div>' },
  BaseTableCell: { name: 'BaseTableCell', template: '<div class="base-table-cell"><slot /></div>' },
}));

const mockDispatch = vi.fn();

const createWrapper = ({
  labels = [],
  isFetching = false,
  error = null,
}) => {
  const mockStore = {
    dispatch: mockDispatch,
    getters: {
      'labels/getLabels': labels,
      'labels/getUIFlags': { isFetching, isCreating: false, isUpdating: false, isDeleting: false },
      'labels/getLabelsError': error,
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

describe('labels/Index.vue', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  it('dispatches labels/get on mount', () => {
    createWrapper({});
    expect(mockDispatch).toHaveBeenCalledWith('labels/get');
  });

  it('renders table when labels exist', () => {
    const wrapper = createWrapper({
      labels: [{ id: 1, title: 'support', color: '#ff0000' }],
    });
    expect(wrapper.find('.base-table').exists()).toBe(true);
  });

  it('renders error banner and retry button on error', async () => {
    const wrapper = createWrapper({ error: 'Erro ao carregar etiquetas' });
    expect(wrapper.text()).toContain('Erro ao carregar etiquetas');
    const retryBtn = wrapper.find('.retry-btn');
    expect(retryBtn.exists()).toBe(true);

    await retryBtn.trigger('click');
    expect(mockDispatch).toHaveBeenCalledWith('labels/get');
  });

  it('disables retry button during isFetching', () => {
    const wrapper = createWrapper({ error: 'Erro ao carregar etiquetas', isFetching: true });
    const retryBtn = wrapper.find('.retry-btn');
    expect(retryBtn.attributes('disabled')).toBeDefined();
  });
});
