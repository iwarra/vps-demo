<script setup lang="ts">
const props = defineProps<{
	title: string;
}>();
</script>

<template>
	<details class="border rounded-sm p-8 gap-4">
		<summary class="text-4xl mb-3 mt-3">{{ props.title }}</summary>
		<div class="mt-4">
			<slot />
		</div>
	</details>
</template>

<style scoped></style>
