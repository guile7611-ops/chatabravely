import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import yaml from '@rollup/plugin-yaml';

const root = path.dirname(fileURLToPath(import.meta.url));
const source = path.join(root, 'app/javascript');

export default defineConfig({
  plugins: [vue(), yaml()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/auth': 'http://localhost:3000',
      '/cable': {
        target: 'ws://localhost:3000',
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js',
      components: path.join(source, 'dashboard/components'),
      next: path.join(source, 'dashboard/components-next'),
      v3: path.join(source, 'v3'),
      dashboard: path.join(source, 'dashboard'),
      helpers: path.join(source, 'shared/helpers'),
      shared: path.join(source, 'shared'),
      survey: path.join(source, 'survey'),
      widget: path.join(source, 'widget'),
      assets: path.join(source, 'dashboard/assets'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: { api: 'modern-compiler' },
    },
  },
});
