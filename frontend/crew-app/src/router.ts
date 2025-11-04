import { createMemoryHistory, createRouter } from 'vue-router';

import LoginPage from '../src/components/LoginPage.vue';
import AlertSettings from '../src/components/AlertSettings.vue';
import TableView from './components/TableView.vue';
import DeliveryAlertSettingsTable from './components/DeliveryAlertSettingsTable.vue';

const routes = [
	{ path: '/home', component: AlertSettings },
	{ path: '/login', component: LoginPage },
	{ path: '/table', component: TableView },
	{ path: '/test', component: DeliveryAlertSettingsTable },
];

export const router = createRouter({
	history: createMemoryHistory(),
	routes,
});
