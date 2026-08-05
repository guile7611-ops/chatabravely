import { mount } from '@vue/test-utils';
import OnboardingView from '../OnboardingView.vue';

vi.mock('dashboard/composables/store', () => ({
  useStoreGetters: () => ({ getCurrentUser: { value: { name: 'Guilherme' } } }),
}));

vi.mock('dashboard/composables/useAccount', () => ({
  useAccount: () => ({ accountId: { value: 1 } }),
}));

describe('OnboardingView', () => {
  it('only renders routes that exist in the Abravely dashboard router', () => {
    const wrapper = mount(OnboardingView, {
      global: {
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a><slot /></a>',
          },
          NextButton: true,
        },
      },
    });

    expect(wrapper.html()).not.toContain('settings_inboxes_new_cloud_whatsapp');
    expect(wrapper.text()).toContain('WhatsApp API Oficial');
  });
});
