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

const createWrapper = ({ inboxes = [], isFetching = false, error = null }) => {
  const mockStore = {
    dispatch: mockDispatch,
    getters: {
      'inboxes/getInboxes': inboxes,
      'inboxes/getInboxesError': error,
      'inboxes/getUIFlags': { isFetching },
      getCurrentUserID: 1,
      getCurrentRole: 'administrator',
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
        ChannelName: true,
        ChannelIcon: true,
        WootModal: true,
        WootDeleteModal: true,
        WootLoadingState: true,
        RouterLink: true,
        WootConfirmDeleteModal: true,
      },
      mocks: {
        $t: key => key,
        $store: mockStore,
      },
    },
  });
};

describe('inbox/Index.vue', () => {
  it('renders empty state when list is empty and no error occurs', () => {
    const wrapper = createWrapper({ inboxes: [], isFetching: false, error: null });
    const layout = wrapper.findComponent({ name: 'SettingsLayout' });
    expect(layout.props('noRecordsFound')).toBe(true);
    expect(wrapper.text()).not.toContain('Erro ao carregar caixas de entrada');
  });

  it('renders error state on failure', () => {
    const wrapper = createWrapper({
      inboxes: [],
      isFetching: false,
      error: 'Falha de conexão com a API de inboxes',
    });
    expect(wrapper.text()).toContain('Falha de conexão com a API de inboxes');
    expect(wrapper.text()).toContain('Tentar novamente');
  });

  it('triggers inboxes/get when clicking "Tentar novamente"', async () => {
    mockDispatch.mockClear();
    const wrapper = createWrapper({
      inboxes: [],
      isFetching: false,
      error: 'Falha de conexão com a API de inboxes',
    });
    const retryBtn = wrapper.findAll('button').find(b => b.text().includes('Tentar novamente'));
    expect(retryBtn.exists()).toBe(true);
    await retryBtn.trigger('click');
    expect(mockDispatch).toHaveBeenCalledWith('inboxes/get');
  });

  it('renders the official Meta API channel in blue', () => {
    const wrapper = createWrapper({
      inboxes: [
        {
          id: 'meta-1',
          name: 'WhatsApp Oficial',
          provider: 'META_CLOUD',
          connection_status: 'CONNECTED',
          channel_type: 'Channel::Whatsapp',
        },
      ],
    });
    const card = wrapper.find('[data-channel-provider="META_CLOUD"]');
    const typeBadge = card.find('[data-test-id="channel-type-badge"]');
    const statusBadge = card.find('[data-test-id="channel-status-badge"]');

    expect(typeBadge.text()).toContain('API Oficial');
    expect(typeBadge.classes()).toContain('bg-n-blue-2');
    expect(statusBadge.classes()).toContain('text-n-blue-11');
  });

  it('keeps Evolution QR Code channels teal', () => {
    const wrapper = createWrapper({
      inboxes: [
        {
          id: 'evolution-1',
          name: 'WhatsApp Vendas',
          provider: 'EVOLUTION',
          connection_status: 'CONNECTED',
          channel_type: 'Channel::Whatsapp',
        },
      ],
    });
    const card = wrapper.find('[data-channel-provider="EVOLUTION"]');
    const typeBadge = card.find('[data-test-id="channel-type-badge"]');
    const statusBadge = card.find('[data-test-id="channel-status-badge"]');

    expect(typeBadge.text()).toContain('QR Code');
    expect(statusBadge.classes()).toContain('text-n-teal-11');
  });
});
