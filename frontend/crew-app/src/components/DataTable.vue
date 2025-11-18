<script setup lang="ts" generic="TData">
import type {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	VisibilityState,
} from '@tanstack/vue-table';

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
import { ref } from 'vue';
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

interface DataTableProps {
	columns: ColumnDef<TData, any>[];
	data: TData[];
}
const props = defineProps<DataTableProps>();

const sorting = ref<SortingState>([]);
const columnFilters = ref<ColumnFiltersState>([]);
const columnVisibility = ref<VisibilityState>({});
const rowSelection = ref({});

const table = useVueTable({
	get data() {
		return props.data;
	},
	get columns() {
		return props.columns;
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
	<div class="space-y-4">
		<DataTableToolbar :table="table" />
		<div class="rounded-md border">
			<!-- Desktop Table -->
			<div class="hidden md:block overflow-x-auto">
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
		</div>

		<!-- Mobile Card Layout -->
		<div class="md:hidden space-y-3">
			<div
				v-for="row in table.getRowModel().rows"
				:key="row.id"
				class="rounded-lg border p-3 shadow-sm bg-white">
				<div
					v-for="cell in row.getVisibleCells()"
					:key="cell.id"
					class="flex justify-between text-sm py-1 border-b last:border-0">
					<span class="font-medium text-gray-500">
						<FlexRender
							:render="(cell.column.columnDef.meta as any)?.title"
							:props="cell.getContext()" />
					</span>
					<span class="text-gray-900">
						<!-- {{ cell.getValue()}} -->
						<FlexRender
							:render="cell.column.columnDef.cell"
							:props="cell.getContext()" />
					</span>
				</div>
			</div>
		</div>

		<DataTablePagination :table="table" />
	</div>
</template>
