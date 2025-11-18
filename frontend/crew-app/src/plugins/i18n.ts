import { createI18n } from 'vue-i18n';

function loadLocaleMessages() {
	const locales = import.meta.glob('../locales/*.json', { eager: true });
	const messages: Record<string, any> = {};
	for (const path in locales) {
		const locale = path.match(/([A-Za-z0-9-_]+)\.json$/)?.[1];
		if (locale) messages[locale] = (locales[path] as any).default;
	}
	return messages;
}

export const i18n = createI18n({
	legacy: false, // Composition API support
	locale: 'en',
	fallbackLocale: 'en',
	messages: loadLocaleMessages(),
});
