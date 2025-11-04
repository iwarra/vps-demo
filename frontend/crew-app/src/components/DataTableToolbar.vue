<script setup lang="ts">
import type { Table } from '@tanstack/vue-table';
import type { Task, DeliveryAlertSetting } from '../data/schema.ts';
import { computed } from 'vue';

import { Cross2Icon } from '@radix-icons/vue';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

import { priorities, myStatuses, deliveryAlertTypes } from '../data/data.ts';
import DataTableFacetedFilter from './DataTableFacetedFilter.vue';
import DataTableViewOptions from './DataTableViewOptions.vue';

interface DataTableToolbarProps {
	table: Table<DeliveryAlertSetting>;
}

const props = defineProps<DataTableToolbarProps>();

const isFiltered = computed(() => props.table.getState().columnFilters.length > 0);
</script>

<template>
	<div class="flex items-center justify-between">
		<div class="flex flex-1 items-center space-x-2">
			<Input
				placeholder="Filter alerts..."
				:model-value="(table.getColumn('description')?.getFilterValue() as string) ?? ''"
				class="h-8 w-[150px] lg:w-[250px]"
				@input="table.getColumn('description')?.setFilterValue($event.target.value)" />
			<DataTableFacetedFilter
				v-if="table.getColumn('status')"
				:column="table.getColumn('status')"
				title="Status"
				:options="myStatuses" />
			<DataTableFacetedFilter
				v-if="table.getColumn('created_by')"
				:column="table.getColumn('created_by')"
				title="Created by"
				:options="priorities" />
			<DataTableFacetedFilter
				v-if="table.getColumn('type')"
				:column="table.getColumn('type')"
				title="Type"
				:options="deliveryAlertTypes" />
			<DataTableFacetedFilter
				v-if="table.getColumn('vehicles')"
				:column="table.getColumn('vehicles')"
				title="Vehicle"
				:options="priorities" />

			<Button
				v-if="isFiltered"
				variant="ghost"
				class="h-8 px-2 lg:px-3"
				@click="table.resetColumnFilters()">
				Reset
				<Cross2Icon class="ml-2 h-4 w-4" />
			</Button>
		</div>
		<DataTableViewOptions :table="table" />
	</div>
</template>
