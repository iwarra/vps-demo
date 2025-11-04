<script setup lang="ts">
import { columns } from '../components/newColumns.ts';
import type { ColumnFiltersState, SortingState, VisibilityState } from '@tanstack/vue-table';
import {
	FlexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useVueTable,
} from '@tanstack/vue-table';
import { ref, onMounted } from 'vue';
import { valueUpdater } from '../lib/utils.ts';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '../components/ui/table';
import DataTablePagination from './DataTablePagination.vue';
import DataTableToolbar from './DataTableToolbar.vue';
import { supabase } from '../supabase';

const data = ref<Array<any>>([]); //fetched data will go here

async function getDeliveryAlertSettings() {
	try {
		const {
			data: { session },
		} = await supabase.auth.getSession();

		if (!session) {
			throw new Error('Not authorized');
		}

		const access_token = session.access_token;
		if (!access_token) throw new Error('No access token returned');
		const response = await fetch('http://localhost:8080/api/delivery-alert-settings', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${access_token}`,
			},
		});
		// if (!response.ok) {
		// 	const errorText = await response.text();
		// 	throw new Error(`API error: ${response.status} ${errorText}`);
		// }

		const result = await response.json();
		console.log('Delivery alert settings:', result);
		data.value = result;
	} catch (error) {
		console.error('getDeliveryAlertSettings error:', error);
	}
}
onMounted(async () => {
	console.log('Mounted!');
	await getDeliveryAlertSettings();
});

const sorting = ref<SortingState>([]);
const columnFilters = ref<ColumnFiltersState>([]);
const columnVisibility = ref<VisibilityState>({});
const rowSelection = ref({});

const table = useVueTable({
	get data() {
		//return props.data; //fetched data should go here!
		return data.value;
	},
	get columns() {
		return columns;
	},
	state: {
		get sorting() {
			return sorting.value;
		},
		get columnFilters() {
			return columnFilters.value;
		},
		get columnVisibility() {
			return columnVisibility.value;
		},
		get rowSelection() {
			return rowSelection.value;
		},
	},
	enableRowSelection: true,
	onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting),
	onColumnFiltersChange: (updaterOrValue) => valueUpdater(updaterOrValue, columnFilters),
	onColumnVisibilityChange: (updaterOrValue) => valueUpdater(updaterOrValue, columnVisibility),
	onRowSelectionChange: (updaterOrValue) => valueUpdater(updaterOrValue, rowSelection),
	getCoreRowModel: getCoreRowModel(),
	getFilteredRowModel: getFilteredRowModel(),
	getPaginationRowModel: getPaginationRowModel(),
	getSortedRowModel: getSortedRowModel(),
	getFacetedRowModel: getFacetedRowModel(),
	getFacetedUniqueValues: getFacetedUniqueValues(),
});
</script>

<template>
	<div class="h-full flex-1 flex-col space-y-8 p-8 md:flex">
		<div class="flex items-center justify-between space-y-2">
			<div>
				<h2 class="text-2xl font-bold tracking-tight">Welcome back!</h2>
				<p class="text-muted-foreground">Here's a list of your tasks for this month!</p>
			</div>
			<div class="flex items-center space-x-2"></div>
		</div>
		<div class="space-y-4">
			<DataTableToolbar :table="table" />
			<div class="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow
							v-for="headerGroup in table.getHeaderGroups()"
							:key="headerGroup.id">
							<TableHead
								v-for="header in headerGroup.headers"
								:key="header.id">
								<FlexRender
									v-if="!header.isPlaceholder"
									:render="header.column.columnDef.header"
									:props="header.getContext()" />
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<template v-if="table.getRowModel().rows?.length">
							<TableRow
								v-for="row in table.getRowModel().rows"
								:key="row.id"
								:data-state="row.getIsSelected() && 'selected'">
								<TableCell
									v-for="cell in row.getVisibleCells()"
									:key="cell.id">
									<FlexRender
										:render="cell.column.columnDef.cell"
										:props="cell.getContext()" />
								</TableCell>
							</TableRow>
						</template>

						<TableRow v-else>
							<TableCell
								:colspan="columns.length"
								class="h-24 text-center">
								No results.
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</div>

			<DataTablePagination :table="table" />
		</div>
	</div>
</template>
