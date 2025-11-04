<script setup lang="ts"></script>

<template>
	<h1>Hello World!</h1>
	<p>Welcome to my new awesome demo!</p>
	<RouterLink
		to="/home"
		class="space"
		>Go to Home</RouterLink
	>
	<RouterLink
		to="/login"
		class="space"
		>Go to Login</RouterLink
	>
	<RouterLink
		to="/table"
		class="space"
		>Table View</RouterLink
	>
	<RouterLink to="/test">My Table View</RouterLink>
	<main>
		<RouterView />
	</main>
</template>

<style scoped>
.space {
	margin-right: 10px;
}
</style>
