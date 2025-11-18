<template>
	<DataTable
		:data="data"
		:columns="columns" />
</template>

<script setup lang="ts">
import DataTable from './DataTable.vue';
import type { Customer } from '../data/schema.ts';
import { columns } from './customerColumns.ts';
import { supabase } from '../supabase';
import { ref, onMounted } from 'vue';
import { authenticateUser } from '../lib/helpers.ts';

const isLoading = ref(false);
const data = ref<Array<Customer>>([]); //fetched data will go

async function getCustomers(): Promise<void> {
	try {
		const { isAuthenticated } = await authenticateUser();
		if (!isAuthenticated) return;
		const response = await supabase.from('customers').select('*');
		if (response.error) throw response.error;
		console.log('Customers:', response.data);
		data.value = response.data;
	} catch (error) {
		console.error('getDeliveryAlertSettings error:', error);
	} finally {
		isLoading.value = false;
	}
}

onMounted(async () => {
	isLoading.value = true;
	await getCustomers();
});
</script>

<style scoped></style>
