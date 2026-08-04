import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CloudWhatsapp from '../CloudWhatsapp.vue';

const mockDispatch = vi.fn();
const mockAlert = vi.fn();

vi.mock('dashboard/composables', () => ({
  useAlert: message => mockAlert(message),
}));

vi.mock('../../../../index', () => ({
  default: {
    replace: vi.fn(),
  },
}));

describe('CloudWhatsapp.vue', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockAlert.mockClear();
  });

  const createWrapper = () => {
    const mockStore = {
      dispatch: mockDispatch,
      getters: {
        'inboxes/getUIFlags': { isCreating: false },
      },
    };

    return shallowMount(CloudWhatsapp, {
      global: {
        mocks: {
          $t: key => key,
          $store: mockStore,
        },
      },
    });
  };

  it('dispatches inboxes/createMetaChannel and alerts on success', async () => {
    const createdInbox = { id: 12, name: 'Meta Cloud Official' };
    mockDispatch.mockResolvedValue(createdInbox);

    const wrapper = createWrapper();
    wrapper.setData({
      inboxName: 'Meta Cloud Official',
      phoneNumber: '+5511999999999',
      apiKey: 'key123',
      phoneNumberId: 'phoneid123',
      businessAccountId: 'waba123',
    });

    await wrapper.vm.createChannel();

    expect(mockDispatch).toHaveBeenCalledWith('inboxes/createMetaChannel', {
      name: 'Meta Cloud Official',
      phone_number: '+5511999999999',
      metaPhoneNumberId: 'phoneid123',
      metaWabaId: 'waba123',
      metaToken: 'key123',
    });
    expect(mockAlert).toHaveBeenCalledWith('Conexão oficial Meta Cloud API criada com sucesso!');
    expect(wrapper.vm.createdChannel).toEqual(createdInbox);
  });

  it('handles API error, displays error alert and does NOT set createdChannel on failure', async () => {
    const apiError = new Error('Falha de autenticação com Meta API');
    mockDispatch.mockRejectedValue(apiError);

    const wrapper = createWrapper();
    wrapper.setData({
      inboxName: 'Meta Cloud Fail',
      phoneNumber: '+5511999999999',
      apiKey: 'key123',
      phoneNumberId: 'phoneid123',
      businessAccountId: 'waba123',
    });

    await wrapper.vm.createChannel();

    expect(mockDispatch).toHaveBeenCalledWith('inboxes/createMetaChannel', expect.any(Object));
    expect(mockAlert).toHaveBeenCalledWith('Falha de autenticação com Meta API');
    expect(wrapper.vm.createdChannel).toBeNull();
  });
});
