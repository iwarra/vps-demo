import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { router } from './router.ts';

import { i18n } from './plugins/i18n.ts';
createApp(App).use(i18n).use(router).mount('#app');
