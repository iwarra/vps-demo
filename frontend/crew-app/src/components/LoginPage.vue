<template>
	<div
		class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
		<div class="text-center mb-8">
			<h1 class="text-xl font-bold text-slate-900 mb-2">Welcome Back</h1>
			<p class="text-slate-600">Sign in to your account</p>
		</div>

		<form
			@submit.prevent="handleSubmit"
			class="space-y-6">
			<!-- Email Input -->
			<div>
				<label
					for="email"
					class="block text-sm font-medium text-slate-700 mb-4">
					Email Address
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
					{{ emailError }}
				</p>
			</div>

			<!-- Password Input -->
			<div>
				<label
					for="password"
					class="block text-sm font-medium text-slate-700 mb-2">
					Password
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
					{{ passwordError }}
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
				class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed">
				Sign In
			</button>
			<button @click="signOut">Sign Out</button>
		</form>
	</div>
</template>

<script setup lang="ts">
import { supabase } from '../supabase';
import { ref, computed } from 'vue';

const email = ref<string>('');
const password = ref<string>('');
const emailError = ref<string>('');
const passwordError = ref<string>('');
const showPassword = ref<boolean>(false);

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
	} catch (error) {
		console.error('Error logging out.');
	}
};
</script>

<style scoped></style>
