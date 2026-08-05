import { shallowMount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { createMemoryHistory, createRouter } from 'vue-router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Evolution from '../Evolution.vue';

const mockDispatch = vi.fn();
const mockAlert = vi.fn();

vi.mock('dashboard/composables', () => ({
  useAlert: message => mockAlert(message),
}));

describe('Evolution.vue', () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    mockAlert.mockReset();
  });

  const createWrapper = async () => {
    const store = createStore({
      modules: {
        inboxes: {
          namespaced: true,
          state: () => ({ uiFlags: { isCreating: false } }),
          getters: { getUIFlags: state => state.uiFlags },
          actions: {
            createEvolutionChannel: (_context, payload) =>
              mockDispatch('inboxes/createEvolutionChannel', payload),
          },
        },
      },
    });
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'settings_inbox_list', component: { template: '<div />' } },
      ],
    });
    await router.push('/');
    await router.isReady();

    return shallowMount(Evolution, {
      global: { plugins: [store, router] },
    });
  };

  const fillForm = wrapper => {
    wrapper.vm.name = 'WhatsApp Vendas';
    wrapper.vm.instanceName = 'vendas';
  };

  it('creates an Evolution Go channel and renders the returned QR Code', async () => {
    mockDispatch.mockResolvedValue({
      qrCodeBase64: 'data:image/png;base64,123',
    });
    const wrapper = await createWrapper();
    fillForm(wrapper);

    await wrapper.vm.connect();

    expect(mockDispatch).toHaveBeenCalledWith(
      'inboxes/createEvolutionChannel',
      { name: 'WhatsApp Vendas', instanceName: 'vendas' }
    );
    expect(wrapper.vm.qrCode).toBe('data:image/png;base64,123');
    expect(wrapper.vm.errorMessage).toBe('');
  });

  it('shows the real backend error and does not invent a connected state', async () => {
    mockDispatch.mockRejectedValue({
      response: { data: { message: 'Instância já em uso' } },
    });
    const wrapper = await createWrapper();
    fillForm(wrapper);

    await wrapper.vm.connect();

    expect(wrapper.vm.errorMessage).toBe('Instância já em uso');
    expect(wrapper.vm.qrCode).toBe('');
  });

  it('keeps the form open when the backend has no QR Code yet', async () => {
    mockDispatch.mockResolvedValue({ qrCodeBase64: '' });
    const wrapper = await createWrapper();
    fillForm(wrapper);

    await wrapper.vm.connect();

    expect(wrapper.vm.qrCode).toBe('');
    expect(mockAlert).toHaveBeenCalledWith(
      'Instância criada. Aguarde a conexão da Evolution Go.'
    );
  });

  it('clears the previous error before a successful retry', async () => {
    mockDispatch
      .mockRejectedValueOnce(new Error('Falha de conexão'))
      .mockResolvedValueOnce({ qrCodeBase64: 'data:image/png;base64,retry' });
    const wrapper = await createWrapper();
    fillForm(wrapper);

    await wrapper.vm.connect();
    expect(wrapper.vm.errorMessage).toBe('Falha de conexão');

    await wrapper.vm.connect();
    expect(wrapper.vm.errorMessage).toBe('');
    expect(wrapper.vm.qrCode).toContain('retry');
  });
});
