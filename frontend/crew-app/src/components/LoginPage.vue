<script setup lang="ts">
import { supabase } from '../supabase';
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const email = ref<string>('');
const password = ref<string>('');
const emailError = ref<string>('');
const passwordError = ref<string>('');
const showPassword = ref<boolean>(false);
const isLoggedIn = ref<boolean>(false);

const validateEmail = (): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!email.value) {
		emailError.value = 'Email is required';
		return false;
	}

	if (!emailRegex.test(email.value)) {
		emailError.value = 'Please enter a valid email address';
		return false;
	}

	emailError.value = '';
	return true;
};

// const validatePassword = (): boolean => {
// 	const hasUpperCase = /[A-Z]/.test(password.value);
// 	const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password.value);

// 	if (!password.value) {
// 		passwordError.value = 'Password is required';
// 		return false;
// 	}

// 	if (password.value.length < 6) {
// 		passwordError.value = 'Password must be at least 6 characters';
// 		return false;
// 	}

// 	if (!hasUpperCase) {
// 		passwordError.value = 'Password must contain at least one uppercase letter';
// 		return false;
// 	}

// 	if (!hasSpecialChar) {
// 		passwordError.value = 'Password must contain at least one special character';
// 		return false;
// 	}

// 	passwordError.value = '';
// 	return true;
// };

const isFormValid = computed(() => {
	return email.value && password.value && !emailError.value && !passwordError.value;
});

const handleSubmit = async () => {
	const isEmailValid = validateEmail();
	//const isPasswordValid = validatePassword();

	//if (isEmailValid && isPasswordValid) {
	try {
		const { data, error } = await supabase.auth.signInWithPassword({
			email: email.value,
			password: password.value,
		});

		if (error) throw error;

		if (data.session) {
			const accessToken = data.session.access_token;
			console.log(accessToken);
			isLoggedIn.value = true;
		}
	} catch (error) {
		console.error('Error signing in', error);
	}
	//}

	email.value = '';
	password.value = '';
};

const signOut = async () => {
	try {
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
		isLoggedIn.value = false;
	} catch (error) {
		console.error('Error logging out.');
	}
};

onMounted(async () => {
	const {
		data: { session },
	} = await supabase.auth.getSession();
	if (session) {
		isLoggedIn.value = true;
	} else {
		isLoggedIn.value = false;
	}
});
</script>

<template>
	<div
		class="flex items-center justify-center p-6"
		style="flex-direction: column; height: 100%">
		<div class="text-center mb-8">
			<div v-if="!isLoggedIn">
				<h1 class="mb-4">{{ t('login_page.title') }}</h1>
				<p>{{ t('login_page.subtitle') }}</p>
			</div>
			<div v-else>
				<h1 class="mb-4">{{ t('login_page.logout_title') }}</h1>
			</div>
		</div>

		<form
			v-if="!isLoggedIn"
			@submit.prevent="handleSubmit"
			class="space-y-6 flex flex-col">
			<!-- Email Input -->
			<div>
				<label
					for="email"
					class="block text-sm font-medium mb-4">
					{{ t('login_page.email') }}
				</label>
				<div class="relative">
					<input
						id="email"
						v-model="email"
						type="email"
						@blur="validateEmail"
						class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
						:class="{ 'border-red-500': emailError }"
						placeholder="you@example.com" />
				</div>
				<p
					v-if="emailError"
					class="mt-2 text-sm text-red-600">
					{{ t('login_page.email_error') }}
				</p>
			</div>

			<!-- Password Input -->
			<div>
				<label
					for="password"
					class="block text-sm font-medium mb-2">
					{{ t('login_page.password') }}
				</label>
				<div class="relative">
					<input
						id="password"
						v-model="password"
						:type="showPassword ? 'text' : 'password'"
						class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-12"
						:class="{ 'border-red-500': passwordError }"
						placeholder="Enter your password" />
				</div>
				<p
					v-if="passwordError"
					class="mt-2 text-sm text-red-600">
					{{ t('login_page.password_error') }}
				</p>
				<!-- <p
					v-else
					class="mt-2 text-xs text-slate-500">
					Min 6 characters, 1 uppercase, 1 special character
				</p> -->
			</div>

			<!-- Submit Button -->
			<button
				type="submit"
				:disabled="!isFormValid"
				class="">
				{{ t('login_page.login_button') }}
			</button>
		</form>
		<button
			v-else
			@click="signOut">
			{{ t('login_page.logout_button') }}
		</button>
	</div>
</template>

<style scoped></style>
