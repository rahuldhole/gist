import * as Vue from 'vue';
import { loadModule } from 'vue3-sfc-loader';
import { polyfillCountryFlagEmojis } from 'country-flag-emoji-polyfill';
import AppLogic from './app.js';

// Polyfill country flags for Windows and unsupported platforms
polyfillCountryFlagEmojis();

const sfcOptions = {
  moduleCache: {
    vue: Vue,
    './app.js': AppLogic,
    'app.js': AppLogic
  },
  async getFile(url) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to load ${url}: ${res.statusText}`);
    }
    return {
      getContentData: (asBinary) => asBinary ? res.arrayBuffer() : res.text()
    };
  },
  addStyle(textContent) {
    const style = document.createElement('style');
    style.textContent = textContent;
    const ref = document.head.getElementsByTagName('style')[0] || null;
    document.head.insertBefore(style, ref);
  },
  handleModule(type, getContentData, path, options) {
    if (type === '.js') {
      const resolved = path.startsWith('/') || path.startsWith('./') ? path : `./${path}`;
      return import(new URL(resolved, window.location.href).href);
    }
    return undefined;
  }
};

async function init() {
  window.__APP_LOGIC__ = AppLogic;
  const App = await loadModule('./js/App.vue', sfcOptions);
  const app = Vue.createApp(App);
  app.mount('#app-root');
}

init().catch(err => {
  console.error('Failed to initialize Vue application:', err);
});

