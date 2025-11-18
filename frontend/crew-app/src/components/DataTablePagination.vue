<script setup lang="ts" generic="TData">
import type { Table } from '@tanstack/vue-table';
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	DoubleArrowLeftIcon,
	DoubleArrowRightIcon,
} from '@radix-icons/vue';
import { Button } from '../components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../components/ui/select';

interface DataTablePaginationProps {
	table: Table<TData>;
}
defineProps<DataTablePaginationProps>();
</script>

<template>
	<div class="flex items-center justify-between">
		<!-- <div class="flex-1 text-sm text-muted-foreground">
			{{ table.getFilteredSelectedRowModel().rows.length }} of
			{{ table.getFilteredRowModel().rows.length }} row(s) selected.
		</div> -->
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
			<div class="flex items-center gap-2 order-2 sm:order-1">
				<p class="text-sm font-medium">Rows per page</p>
				<Select
					:model-value="`${table.getState().pagination.pageSize}`"
					@update:model-value="table.setPageSize as any">
					<SelectTrigger class="h-8">
						<SelectValue :placeholder="`${table.getState().pagination.pageSize}`" />
					</SelectTrigger>
					<SelectContent side="top">
						<SelectItem
							v-for="pageSize in [10, 20, 30, 40, 50]"
							:key="pageSize"
							:value="`${pageSize}`">
							{{ pageSize }}
						</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<div class="flex items-center sm:justify-end gap-4 order-1 sm:order-2">
				<div class="text-sm font-medium">
					Page {{ table.getState().pagination.pageIndex + 1 }} of
					{{ table.getPageCount() }}
				</div>
				<div class="flex items-center gap-2">
					<Button
						variant="outline"
						class="hidden h-8 w-8 p-0 lg:flex"
						:disabled="!table.getCanPreviousPage()"
						@click="table.setPageIndex(0)">
						<span class="sr-only">Go to first page</span>
						<DoubleArrowLeftIcon class="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						class="h-8 w-8 p-0"
						:disabled="!table.getCanPreviousPage()"
						@click="table.previousPage()">
						<span class="sr-only">Go to previous page</span>
						<ChevronLeftIcon class="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						class="h-8 w-8 p-0"
						:disabled="!table.getCanNextPage()"
						@click="table.nextPage()">
						<span class="sr-only">Go to next page</span>
						<ChevronRightIcon class="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						class="hidden h-8 w-8 p-0 lg:flex"
						:disabled="!table.getCanNextPage()"
						@click="table.setPageIndex(table.getPageCount() - 1)">
						<span class="sr-only">Go to last page</span>
						<DoubleArrowRightIcon class="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	</div>
</template>
