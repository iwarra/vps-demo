<script setup lang="ts">
import { columns } from './delAlertSettingColumns.ts';
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
import { ref, onMounted, onUnmounted } from 'vue';
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
import type { RealtimeChannel } from '@supabase/supabase-js';
import { authenticateUser, setupRealtimeSubscription } from '../lib/helpers.ts';

const data = ref<Array<any>>([]); //fetched data will go here
const isLoading = ref(true);
let realtimeChannel: RealtimeChannel | null = null;

async function getDeliveryAlertSettings() {
	try {
		const { isAuthenticated } = await authenticateUser();
		if (!isAuthenticated) return;

		const response = await supabase
			.from('delivery_alert_settings')
			.select(
				'delivery_alert_setting_id, description, vehicles, type, status, trigger_values, active_hours, active_dates, created_by, delivery_alert_setting_id',
			)
			.filter('is_deleted', 'is', null);
		if (response.error) {
			throw response.error;
		}
		console.log('Delivery alert settings:', response.data);
		data.value = response.data;
	} catch (error) {
		console.error('getDeliveryAlertSettings error:', error);
	} finally {
		isLoading.value = false;
	}
}

function handleRealtimeChange(payload: any) {
	const { eventType, new: newRecord, old: oldRecord } = payload;

	switch (eventType) {
		case 'INSERT':
			data.value = [...data.value, newRecord];
			break;

		case 'UPDATE':
			// If updated record is marked as deleted, remove it
			if (newRecord.is_deleted) {
				data.value = data.value.filter(
					(item) => item.delivery_alert_setting_id !== newRecord.delivery_alert_setting_id,
				);
			} else {
				data.value = data.value.map((item) =>
					item.delivery_alert_setting_id === newRecord.delivery_alert_setting_id ? newRecord : item,
				);
			}
			break;

		case 'DELETE':
			data.value = data.value.filter(
				(item) => item.delivery_alert_setting_id !== oldRecord.delivery_alert_setting_id,
			);
			break;
	}
}

onMounted(async () => {
	await getDeliveryAlertSettings();
	realtimeChannel = setupRealtimeSubscription('delivery_alert_settings', handleRealtimeChange);
});

onUnmounted(() => {
	if (realtimeChannel) {
		supabase.removeChannel(realtimeChannel);
		console.log('Unsubscribed from delivery_alert_settings changes');
	}
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
	<div class="h-full flex-1 flex-col space-y-8 py-8 md:flex">
		<div class="flex items-center justify-between space-y-2">
			<div>
				<h2 class="text-2xl font-bold tracking-tight">Welcome back!</h2>
				<p class="text-muted-foreground">Here's a list of your delivery alert settings!</p>
			</div>
			<div class="flex items-center space-x-2"></div>
		</div>
		<template v-if="isLoading">Loading...</template>
		<div
			v-else
			class="space-y-4">
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
