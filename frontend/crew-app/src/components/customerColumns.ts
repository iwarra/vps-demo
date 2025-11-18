import type { ColumnDef } from '@tanstack/vue-table';
import type { Customer } from '../data/schema.ts';
import { h } from 'vue';
import DataTableColumnHeader from './DataTableColumnHeader.vue';
import DataTableRowActions from './DataTableRowActions.vue';
import { i18n } from '@/plugins/i18n';

export const columns: ColumnDef<Customer>[] = [
	{
		id: 'actions',
		meta: { title: '' },
		enableHiding: false,
		cell: ({ row }) =>
			h(DataTableRowActions, {
				row: row as any,
				getId: (item: unknown) => (item as Customer).customer_id as string,
			}),
	},
	{
		accessorKey: 'customer_id',
		header: () => null,
		cell: () => null,
		enableSorting: false,
		enableHiding: true,
	},
	{
		accessorKey: 'name',
		meta: { title: i18n.global.t('customer_table.name') },
		header: ({ column }) =>
			h(DataTableColumnHeader, {
				column: column as any,
				title: i18n.global.t('customer_table.name'),
			}),
		cell: ({ row }) => h('div', row.getValue('name')),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: 'address',
		meta: { title: i18n.global.t('customer_table.address') },
		header: ({ column }) =>
			h(DataTableColumnHeader, {
				column: column as any,
				title: i18n.global.t('customer_table.address'),
			}),
		cell: ({ row }) => h('div', { class: 'w-20' }, row.getValue('address')),
		enableSorting: false,
		enableHiding: true,
	},
	{
		accessorKey: 'org_number',
		meta: { title: i18n.global.t('customer_table.org_number') },
		header: ({ column }) =>
			h(DataTableColumnHeader, {
				column: column as any,
				title: i18n.global.t('customer_table.org_number'),
			}),
		cell: ({ row }) => h('div', { class: 'w-20' }, row.getValue('org_number')),
		filterFn: (row, id, filterValues) => {
			const rowValues = row.getValue(id) as string[];
			return filterValues.length === 0 || rowValues.some((v) => filterValues.includes(v));
		},
		enableSorting: false,
	},
	{
		accessorKey: 'user_id',
		meta: { title: i18n.global.t('customer_table.user') },
		header: ({ column }) =>
			h(DataTableColumnHeader, {
				column: column as any,
				title: i18n.global.t('customer_table.user'),
			}),
		cell: ({ row }) => h('div', { class: 'w-20' }, row.getValue('user_id')),
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
		enableSorting: false,
	},
];
