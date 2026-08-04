<script>
import { mapGetters } from 'vuex';
import LoadingState from './components/widgets/LoadingState.vue';
import NetworkNotification from './components/NetworkNotification.vue';
import UpdateBanner from './components/app/UpdateBanner.vue';
import StatusBanner from './components/app/StatusBanner.vue';
import PaymentPendingBanner from './components/app/PaymentPendingBanner.vue';
import PendingEmailVerificationBanner from './components/app/PendingEmailVerificationBanner.vue';
import { useRouter } from 'vue-router';
import { useStore } from 'dashboard/composables/store';
import WootSnackbarBox from './components/SnackbarContainer.vue';
import { setColorTheme } from './helper/themeHelper';
import { isOnOnboardingView } from 'v3/helpers/RouteHelper';
import { useAccount } from 'dashboard/composables/useAccount';
import { useFontSize } from 'dashboard/composables/useFontSize';
import { useUISettings } from 'dashboard/composables/useUISettings';
import SocketIoConnector from './helper/socketIoConnector';
import { getAbravelyJwtToken } from './helper/abravelyToken';

export default {
  name: 'App',

  components: {
    LoadingState,
    NetworkNotification,
    UpdateBanner,
    StatusBanner,
    PaymentPendingBanner,
    WootSnackbarBox,
    PendingEmailVerificationBanner,
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    const { accountId } = useAccount();
    const { currentFontSize } = useFontSize();
    const { uiSettings } = useUISettings();

    return {
      router,
      store,
      currentAccountId: accountId,
      currentFontSize,
      uiSettings,
    };
  },
  data() {
    return {
      latestChatwootVersion: null,
      reconnectService: null,
      socketIoConnector: null,
    };
  },
  computed: {
    ...mapGetters({
      getAccount: 'accounts/getAccount',
      isRTL: 'accounts/isRTL',
      currentUser: 'getCurrentUser',
      authUIFlags: 'getAuthUIFlags',
    }),
    hideOnOnboardingView() {
      return !isOnOnboardingView(this.$route);
    },
    isAccountRoute() {
      const path = this.$route?.path || '';
      return path.startsWith('/app/accounts/') && Boolean(this.currentAccountId);
    },
  },

  watch: {
    currentAccountId: {
      immediate: true,
      handler() {
        if (this.isAccountRoute && getAbravelyJwtToken()) {
          this.initializeAccount();
          this.initializeSocketIo();
        }
      },
    },
    $route(to) {
      if (to?.path?.startsWith('/app/accounts/') && this.currentAccountId && getAbravelyJwtToken()) {
        this.initializeAccount();
        this.initializeSocketIo();
      } else if (!to?.path?.startsWith('/app/accounts/')) {
        this.destroySocketIo();
      }
    },
  },
  mounted() {
    this.initializeColorTheme();
    this.setLocale('pt_BR');
  },
  unmounted() {
    this.destroySocketIo();
  },
  methods: {
    initializeSocketIo() {
      if (!this.socketIoConnector) {
        this.socketIoConnector = new SocketIoConnector(this);
        this.socketIoConnector.connect();
        window.__abravelySocketConnector = this.socketIoConnector;
      }
    },
    destroySocketIo() {
      if (this.socketIoConnector) {
        this.socketIoConnector.disconnect();
        this.socketIoConnector = null;
        window.__abravelySocketConnector = null;
      }
    },
    initializeColorTheme() {
      setColorTheme(true); // Default to Dark Mode
    },
    setLocale(locale) {
      const savedLocale = localStorage.getItem('user_locale');
      const targetLocale = locale || savedLocale || this.currentUser?.locale || 'pt_BR';
      if (this.$i18n) {
        if (typeof this.$i18n.locale === 'object' && this.$i18n.locale !== null) {
          this.$i18n.locale.value = targetLocale;
        } else {
          this.$i18n.locale = targetLocale;
        }
      }
      if (this.$root && this.$root.$i18n) {
        if (typeof this.$root.$i18n.locale === 'object' && this.$root.$i18n.locale !== null) {
          this.$root.$i18n.locale.value = targetLocale;
        } else {
          this.$root.$i18n.locale = targetLocale;
        }
      }
    },
    async initializeAccount() {
      try {
        await this.$store.dispatch('accounts/get');
      } catch (e) {
        // Suppress API errors in standalone mode
      } finally {
        this.setLocale();
      }
    },
  },
};
</script>

<template>
  <div
    id="app"
    class="flex flex-col w-full h-screen min-h-0 bg-n-background text-white dark"
    :dir="isRTL ? 'rtl' : 'ltr'"
  >
    <router-view />
    <WootSnackbarBox />
  </div>
</template>

<style lang="scss">
@import './assets/scss/app';

.v-popper--theme-tooltip .v-popper__inner {
  background: black !important;
  font-size: 0.75rem;
  padding: 4px 8px !important;
  border-radius: 6px;
  font-weight: 400;
}

.v-popper--theme-tooltip .v-popper__arrow-container {
  display: none;
}
</style>
