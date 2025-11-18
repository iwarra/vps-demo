<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { i18n } from '@/plugins/i18n';
import LanguageMenu from './components/LanguageMenu.vue';
const { t } = useI18n();

const saved = localStorage.getItem('locale');
if (saved) i18n.global.locale.value = saved;
</script>

<template>
	<h1 class="mb-4">{{ t('greeting') }}</h1>
	<p class="mb-3">{{ t('welcome_message') }}</p>
	<LanguageMenu class="mb-2" />
	<br />
	<RouterLink
		to="/alert-settings/new"
		class="space"
		>{{ t('app_page.router_link_1') }}</RouterLink
	>
	<RouterLink
		to="/login"
		class="space"
		>{{ t('app_page.router_link_2') }}</RouterLink
	>
	<RouterLink
		to="/table"
		class="space"
		>{{ t('app_page.router_link_3') }}</RouterLink
	>
	<RouterLink to="/test">{{ t('app_page.router_link_4') }}</RouterLink>
	<RouterLink to="/category"> Category Page </RouterLink>
	<main>
		<RouterView />
	</main>
</template>

<style scoped>
.space {
	margin-right: 10px;
}
</style>
