<template>
	<div
		class="relative inline-block text-left"
		@keydown.escape="closeMenu">
		<!-- Button -->
		<button
			id="lang-button"
			@click="toggleMenu"
			aria-haspopup="true"
			:aria-expanded="open"
			class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
			<img
				:src="current.flag"
				:alt="`${current.label} flag`"
				class="h-4 w-4" />
			<span>{{ current.label }}</span>
			<svg
				class="h-4 w-4 text-gray-500"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 9l-7 7-7-7" />
			</svg>
		</button>

		<!-- Dropdown -->
		<ul
			v-if="open"
			role="menu"
			aria-labelledby="lang-button"
			class="absolute right-0 mt-2 w-40 origin-top-right rounded-lg border bg-white shadow-lg focus:outline-none">
			<li
				v-for="lang in languages"
				:key="lang.code"
				role="menuitem">
				<button
					@click="changeLanguage(lang.code)"
					class="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
					:aria-pressed="current.code === lang.code">
					<img
						:src="lang.flag"
						:alt="`${lang.label} flag`"
						class="h-4 w-4" />
					<span>{{ lang.label }}</span>
					<span
						v-if="current.code === lang.code"
						class="ml-auto text-blue-600"
						>✔</span
					>
				</button>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { i18n } from '@/plugins/i18n';

type Language = {
	code: string;
	label: string;
	flag: string;
};

const languages: Language[] = [
	{ code: 'en', label: 'English', flag: '/flags/en.svg' },
	{ code: 'sv', label: 'Swedish', flag: '/flags/sv.svg' },
];

const open = ref(false);
const { locale } = useI18n();
const found = languages.find((l) => l.code === locale.value);
const initialLang: Language = (found ? found : languages[0]) as Language;
const current = ref<Language>(initialLang);
function toggleMenu() {
	open.value = !open.value;
}

function closeMenu() {
	open.value = false;
}

function changeLanguage(code: string) {
	i18n.global.locale.value = code;
	current.value = languages.find((l) => l.code === code) ?? current.value;
	localStorage.setItem('locale', code);
	closeMenu();
}
</script>

<style scoped>
/* Optional — to improve keyboard focus outline visibility */
button:focus-visible {
	outline: 2px solid #2563eb;
	outline-offset: 2px;
}
</style>
