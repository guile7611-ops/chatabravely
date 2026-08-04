import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Evolution from '../Evolution.vue';

const mockDispatch = vi.fn();
const mockAlert = vi.fn();
global.fetch = vi.fn();

vi.mock('dashboard/composables', () => ({
  useAlert: message => mockAlert(message),
}));

describe('Evolution.vue', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockAlert.mockClear();
    vi.clearAllMocks();
  });

  const createWrapper = () => {
    const mockStore = {
      dispatch: mockDispatch,
      getters: {
        'inboxes/getUIFlags': { isCreating: false },
        getCurrentUser: { access_token: 'token123' },
        getCurrentAccountId: 1,
      },
    };

    return shallowMount(Evolution, {
      global: {
        mocks: {
          $t: key => key,
          $store: mockStore,
        },
      },
    });
  };

  it('starts in idle status and transitions through creating state', async () => {
    const wrapper = createWrapper();
    expect(wrapper.vm.connectionStatus).toBe('idle');
  });

  it('sets error status when Evolution instance creation fetch fails', async () => {
    mockDispatch.mockResolvedValue({ id: 99, inbox_identifier: 'ident123' });
    global.fetch.mockRejectedValue(new Error('Serviço de QR Code indisponível'));

    const wrapper = createWrapper();
    wrapper.setData({
      channelName: 'WhatsApp Evolution Fail',
      phoneNumber: '11988888888',
      evolutionUrl: 'http://localhost:8080',
    });

    await wrapper.vm.createChannel();

    expect(mockDispatch).toHaveBeenCalledWith('inboxes/createChannel', expect.any(Object));
    expect(wrapper.vm.connectionStatus).toBe('error');
    expect(wrapper.vm.errorMessage).toContain('WhatsApp QR Code');
    expect(wrapper.vm.connectionStatus).not.toBe('connected');
  });

  it('sets error status when instance creation returns HTTP error', async () => {
    mockDispatch.mockResolvedValue({ id: 99, inbox_identifier: 'ident123' });
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Instância já em uso' }),
    });

    const wrapper = createWrapper();
    wrapper.setData({
      channelName: 'WhatsApp Evolution Err',
      phoneNumber: '11988888888',
    });

    await wrapper.vm.createChannel();

    expect(wrapper.vm.connectionStatus).toBe('error');
    expect(wrapper.vm.errorMessage).toContain('Instância já em uso');
    expect(wrapper.vm.connectionStatus).not.toBe('connected');
  });

  it('resets error and allows retry when createChannel is called again', async () => {
    const wrapper = createWrapper();
    wrapper.setData({
      connectionStatus: 'error',
      errorMessage: 'Erro anterior',
      channelName: 'WhatsApp Evolution Retry',
      phoneNumber: '11988888888',
    });

    mockDispatch.mockResolvedValue({ id: 100, inbox_identifier: 'ident456' });
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ qrcode: { base64: 'data:image/png;base64,123' } }),
    });

    await wrapper.vm.createChannel();

    expect(wrapper.vm.errorMessage).toBe('');
    expect(wrapper.vm.connectionStatus).not.toBe('error');
  });
});
