import { createMemoryHistory, createRouter } from 'vue-router';

import LoginPage from '../src/components/LoginPage.vue';
import AlertSettings from '../src/components/AlertSettings.vue';
import TableView from './components/TableView.vue';
import DeliveryAlertSettingsTable from './components/DeliveryAlertSettingsTable.vue';
import CategoryPage from './components/CategoryPage.vue';

const routes = [
	{
		path: '/alert-settings/new',
		name: 'alert-settings-new',
		component: AlertSettings,
	},
	{
		path: '/alert-settings/:id/edit',
		name: 'alert-settings-edit',
		component: AlertSettings,
	},
	{
		path: '/alert-settings/:id/copy',
		name: 'alert-settings-copy',
		component: AlertSettings,
	},
	{ path: '/login', component: LoginPage },
	{ path: '/table', component: TableView },
	{ path: '/test', component: DeliveryAlertSettingsTable },
	{ path: '/category', component: CategoryPage },
];

export const router = createRouter({
	history: createMemoryHistory(),
	routes,
});
