import type { ColumnDef } from '@tanstack/vue-table';
import type { DeliveryAlertSetting } from '../data/schema.ts';
import { h } from 'vue';
import { myStatuses } from '../data/data.ts';
import DataTableColumnHeader from './DataTableColumnHeader.vue';
import DataTableRowActions from './DataTableRowActions.vue';

export const columns: ColumnDef<DeliveryAlertSetting>[] = [
	// {
	// 	accessorKey: 'id',
	// 	header: ({ column }) => h(DataTableColumnHeader, { column, title: 'id' }),
	// 	cell: ({ row }) => h('div', { class: 'w-20' }, row.getValue('id')),
	// 	enableSorting: false,
	// 	enableHiding: false,
	// },
	{
		accessorKey: 'description',
		header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Description' }),
		cell: ({ row }) => h('div', { class: 'max-w-[500px] truncate' }, row.getValue('description')),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: 'type',
		header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Type' }),
		cell: ({ row }) => h('div', { class: 'w-20' }, row.getValue('type')),
		enableSorting: false,
		enableHiding: true,
	},
	{
		accessorKey: 'vehicles',
		header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Vehicle' }),
		cell: ({ row }) => {
			const regs = row.getValue('vehicles') as string[];

			return h(
				'div',
				{ class: 'flex flex-col space-y-1' },
				regs.map((reg) => h('div', { class: 'w-20' }, `${reg.split('-')[0]}`)),
			);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
		enableSorting: false,
	},
	{
		accessorKey: 'status',
		header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Status' }),

		cell: ({ row }) => {
			const status = myStatuses.find((status) => status.value === row.getValue('status'));

			if (!status) return null;

			return h('div', { class: 'flex w-[100px] items-center' }, [
				status.icon && h(status.icon, { class: 'mr-2 h-4 w-4 text-muted-foreground' }),
				h('span', status.label),
			]);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
		enableSorting: false,
	},
	{
		accessorKey: 'active_dates',
		header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Active Dates' }),

		cell: ({ row }) => {
			const dates: { to: string; from: string }[] = row.getValue('active_dates');
			return h(
				'div',
				{ class: 'flex flex-col space-y-1' },
				dates.map((d) =>
					h('span', { class: 'w-20 text-sm' }, `${d.from.substring(2)} → ${d.to.substring(2)}`),
				),
			);
		},
		enableSorting: false,
	},
	{
		accessorKey: 'active_hours',
		header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Active Hours' }),
		cell: ({ row }) => {
			const hours: { to: string; from: string }[] = row.getValue('active_hours'); // this is an array
			return h(
				'div',
				{ class: 'flex flex-col space-y-1' },
				hours.map((hour) => h('div', { class: 'w-20 text-sm' }, `${hour.from} → ${hour.to}`)),
			);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
		enableSorting: false,
	},
	{
		accessorKey: 'trigger_values',
		header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Trigger Values' }),
		cell: ({ row }) => {
			const trigger: { min: string; max: string } = row.getValue('trigger_values');
			if (trigger.min && trigger.max) {
				return h('div', { class: 'w-20 text-sm' }, `${trigger.min} - ${trigger.max}`);
			}
			if (trigger.min) return h('div', { class: 'w-20 text-sm' }, `under: ${trigger.min}`);
			if (trigger.max) return h('div', { class: 'w-20 text-sm' }, `over: ${trigger.max}`);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
		enableSorting: false,
	},
	{
		accessorKey: 'created_by',
		header: ({ column }) => h(DataTableColumnHeader, { column, title: 'Created by' }),
		cell: ({ row }) => {
			const creator = row.getValue('created_by') as string;
			return h('div', { class: 'w-20' }, creator.split('-')[0]);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
	},
	{
		id: 'actions',
		cell: ({ row }) => h(DataTableRowActions, { row }),
	},
];
