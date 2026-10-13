import { createApp } from 'vue';
import { polyfillCountryFlagEmojis } from 'country-flag-emoji-polyfill';
import App from './app.js';

// Polyfill country flags for Windows and unsupported platforms
polyfillCountryFlagEmojis();

// Mount Vue application
const app = createApp(App);
app.mount('#app');
