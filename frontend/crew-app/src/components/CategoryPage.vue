<script setup>
import DetailsItem from './DetailsItem.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<template>
	<div class="mt-6 space-y-6 w-100%">
		<!-- <h1>{{ t('category.title') }}</h1> -->
		<h1>Category title</h1>
		<h2>Category status info</h2>
		<DetailsItem title="Current status">
			<details class="space-y-2 mb-3 mt-6">
				<summary class="text-xl">Sensor info:</summary>
				<p>Temperature:</p>
				<p>Speed:</p>
				<p>Last location:</p>
				<p>ETA estimate:</p>
			</details>
			<hr class="pt-2 mb-3" />
			<div class="space-y-2">
				<p>Delivery number:</p>
				<p>Driver:</p>
				<div>
					<a
						href="/"
						target="_blank"
						>Print vehicle QR</a
					>
				</div>
			</div>
		</DetailsItem>
		<DetailsItem title="Settings">
			<div class="mt-8 mb-6">
				<button class="btn-add mr-3">Add driver</button>
				<button class="btn-edit mr-3">Edit driver</button>
			</div>
			<hr class="mt-3 mb-3" />
			<details class="space-y-4">
				<summary class="text-xl">Devices</summary>
				<ul class="space-y-4 mb-4">
					<li class="flex flex-row gap-2 justify-between items-center">
						<span>Device 1</span>
						<div class="space-x-3">
							<button class="btn-edit">Edit</button>
							<button class="btn-delete">Remove</button>
						</div>
					</li>
					<li class="flex flex-row gap-2 justify-between items-center">
						<span>Device 2</span>
						<div class="space-x-3">
							<button class="btn-edit">Edit</button>
							<button class="btn-delete">Remove</button>
						</div>
					</li>
				</ul>
			</details>
			<button class="btn-add">Add a new device</button>
		</DetailsItem>
		<DetailsItem title="Reports and summaries"><a href="">Driving journal</a></DetailsItem>
	</div>
</template>

<style scoped>
/* details > summary {
	list-style: none;
}
details > summary::-webkit-details-marker {
	display: none;
} */
</style>
