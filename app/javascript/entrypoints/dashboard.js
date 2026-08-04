import * as Vue from 'vue';
import { createI18n } from 'vue-i18n';
import axios from 'axios';

if (typeof globalThis !== 'undefined') globalThis.Vue = Vue;
if (typeof window !== 'undefined') window.Vue = Vue;

import { plugin, defaultConfig } from '@formkit/vue';
import WootWizard from 'components/ui/Wizard.vue';
import FloatingVue from 'floating-vue';
import WootUiKit from 'dashboard/components';
import App from 'dashboard/App.vue';
import i18nMessages from 'dashboard/i18n';
import createAxios from 'dashboard/helper/APIHelper';

import commonHelpers, { isJSONValid } from 'dashboard/helper/commons';
import { createPinia } from 'pinia';
import router, { initalizeRouter } from 'dashboard/routes';
import store from 'dashboard/store';
import constants from 'dashboard/constants/globals';
import FluentIcon from 'shared/components/FluentIcon/DashboardIcon.vue';
import VueDOMPurifyHTML from 'vue-dompurify-html';
import { domPurifyConfig } from 'shared/helpers/HTMLSanitizer.js';

import { vResizeObserver } from '@vueuse/components';
import { directive as onClickaway } from 'vue3-click-away';

import 'floating-vue/dist/style.css';

export const i18n = createI18n({
  legacy: false,
  locale: 'pt_BR',
  fallbackLocale: 'pt_BR',
  messages: i18nMessages,
});

export const pinia = createPinia();

export const bootstrapDashboardApp = (mountTarget = '#app') => {
  const app = Vue.createApp(App);
  app.use(i18n);
  app.use(store);
  app.use(pinia);
  app.use(router);

  app.use(VueDOMPurifyHTML, domPurifyConfig);
  app.use(WootUiKit);
  app.use(
    plugin,
    defaultConfig({
      rules: {
        JSON: ({ value }) => isJSONValid(value),
      },
    })
  );
  app.use(FloatingVue, {
    instantMove: true,
    arrowOverflow: false,
    disposeTimeout: 5000000,
  });

  try {
    const hljsVuePlugin = require('@highlightjs/vue-plugin');
    const pluginComponent = hljsVuePlugin?.default || hljsVuePlugin;
    if (pluginComponent) app.use(pluginComponent);
  } catch (e) {
    // Ignore highlightjs if not available in test runner
  }

  app.component('woot-wizard', WootWizard);
  app.component('fluent-icon', FluentIcon);

  app.directive('resize', vResizeObserver);
  app.directive('on-clickaway', onClickaway);

  commonHelpers();
  window.WootConstants = constants;
  window.axios = createAxios(axios);

  initalizeRouter();

  if (mountTarget) {
    const el = typeof mountTarget === 'string' ? document.querySelector(mountTarget) : mountTarget;
    if (el) {
      app.mount(el);
    }
  }

  return { app, store, router, i18n, pinia };
};

if (typeof window !== 'undefined' && document.querySelector('#app')) {
  bootstrapDashboardApp('#app');
}
