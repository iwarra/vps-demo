<script setup lang="ts" generic="TData">
import type { Table } from '@tanstack/vue-table';
import { computed } from 'vue';
import { Cross2Icon } from '@radix-icons/vue';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { myStatuses, deliveryAlertTypes } from '../data/data.ts';
import DataTableFacetedFilter from './DataTableFacetedFilter.vue';
import DataTableViewOptions from './DataTableViewOptions.vue';

interface DataTableToolbarProps {
	table: Table<TData>;
}

const props = defineProps<DataTableToolbarProps>();
const creatorColumn = props.table.getColumn('created_by');
const vehicleColumn = props.table.getColumn('vehicles');
const isFiltered = computed(() => props.table.getState().columnFilters.length > 0);

const vehicleOptions = computed(
	() =>
		[...vehicleColumn.getFacetedUniqueValues().keys()]
			.flatMap((value) => value) // flatten arrays
			.filter((v, i, arr) => arr.indexOf(v) === i) // remove duplicates
			.sort()
			.map((v) => ({ label: v, value: v })), // <-- this is what your filter component expects
);

const creatorOptions = computed(() =>
	[...creatorColumn.getFacetedUniqueValues().keys()].sort().map((v) => ({ label: v, value: v })),
);
</script>

<template>
	<div class="flex flex-1 flex-col sm:flex-row flex-wrap gap-3 items-start">
		<Input
			placeholder="Filter alerts..."
			:model-value="(table.getColumn('description')?.getFilterValue() as string) ?? ''"
			class="h-8 w-[150px] lg:w-[250px]"
			@input="table.getColumn('description')?.setFilterValue($event.target.value)" />
		<DataTableViewOptions :table="table" />
		<div
			class="flex flex-1 flex-col sm:flex-row flex-wrap gap-3 place-content-center sm:place-content-end">
			<DataTableFacetedFilter
				v-if="table.getColumn('status')"
				:column="table.getColumn('status')"
				title="Status"
				:options="myStatuses" />
			<DataTableFacetedFilter
				v-if="table.getColumn('created_by')"
				:column="table.getColumn('created_by')"
				title="Created by"
				:options="creatorOptions" />
			<DataTableFacetedFilter
				v-if="table.getColumn('type')"
				:column="table.getColumn('type')"
				title="Type"
				:options="deliveryAlertTypes" />
			<DataTableFacetedFilter
				v-if="table.getColumn('vehicles')"
				:column="table.getColumn('vehicles')"
				title="Vehicle"
				:options="vehicleOptions" />

			<Button
				v-if="isFiltered"
				variant="ghost"
				class="h-8 px-2 lg:px-3"
				@click="table.resetColumnFilters()">
				Reset
				<Cross2Icon class="ml-2 h-4 w-4" />
			</Button>
		</div>
	</div>
</template>
