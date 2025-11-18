import type { ColumnDef } from '@tanstack/vue-table';
import type { DeliveryAlertSetting } from '../data/schema.ts';
import { h } from 'vue';
import { myStatuses } from '../data/data.ts';
import DataTableColumnHeader from './DataTableColumnHeader.vue';
import DataTableRowActions from './DataTableRowActions.vue';
import { supabase } from '@/supabase.ts';
import { useRouter } from 'vue-router';
import { i18n } from '@/plugins/i18n';

export const columns: ColumnDef<DeliveryAlertSetting>[] = [
	{
		id: 'actions',
		meta: { title: '' },
		enableHiding: false,
		cell: ({ row }) => {
			const router = useRouter();
			return h(DataTableRowActions, {
				row: row as any,
				getId: (item: unknown) =>
					(item as DeliveryAlertSetting).delivery_alert_setting_id as string,
				onDelete: async (item: unknown) => {
					try {
						const {
							data: { session },
						} = await supabase.auth.getSession();

						if (!session) {
							throw new Error('Not authorized');
						}

						const access_token = session.access_token;
						if (!access_token) throw new Error('No access token returned');
						const id = (item as DeliveryAlertSetting).delivery_alert_setting_id;
						const response = await fetch(`http://localhost:8080/api/delivery-alert-setting/${id}`, {
							method: 'DELETE',
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${access_token}`,
							},
						});
						if (!response.ok) {
							const errorText = await response.text();
							throw new Error(`API error: ${response.status} ${errorText}`);
						}

						//data.value = result;
					} catch (error) {
						console.error('getDeliveryAlertSettings error:', error);
					}
				},
				onEdit: (item: unknown) => {
					const id = (item as DeliveryAlertSetting).delivery_alert_setting_id;
					router.push({
						name: 'alert-settings-edit',
						params: { id },
					});
				},
				onCopy: async (item: unknown) => {
					const id = (item as DeliveryAlertSetting).delivery_alert_setting_id;
					await router.push({
						name: 'alert-settings-copy',
						params: { id },
					});
				},
			});
		},
	},
	{
		accessorKey: 'delivery_alert_setting_id',
		header: () => null,
		cell: () => null,
		enableSorting: false,
		enableHiding: true,
	},
	{
		accessorKey: 'description',
		meta: { title: i18n.global.t('del_alert_settings_table.description') },
		header: ({ column }) =>
			h(DataTableColumnHeader, {
				column: column as any,
				title: i18n.global.t('del_alert_settings_table.description'),
			}),
		cell: ({ row }) => h('div', { class: 'max-w-[500px] truncate' }, row.getValue('description')),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: 'type',
		meta: { title: i18n.global.t('del_alert_settings_table.type') },
		header: ({ column }) =>
			h(DataTableColumnHeader, {
				column: column as any,
				title: i18n.global.t('del_alert_settings_table.type'),
			}),
		cell: ({ row }) => h('div', { class: 'w-20' }, row.getValue('type')),
		enableSorting: false,
		enableHiding: true,
	},
	{
		accessorKey: 'vehicles',
		meta: { title: i18n.global.t('del_alert_settings_table.vehicles') },
		header: ({ column }) =>
			h(DataTableColumnHeader, {
				column: column as any,
				title: i18n.global.t('del_alert_settings_table.vehicles'),
			}),
		cell: ({ row }) => {
			const registrations = row.getValue('vehicles') as string[];

			return h(
				'div',
				{ class: 'flex flex-col space-y-1' },
				registrations.map((reg) => h('div', { class: 'w-20' }, `${reg.split('-')[0]}`)),
			);
		},
		filterFn: (row, id, filterValues) => {
			const rowValues = row.getValue(id) as string[];
			return filterValues.length === 0 || rowValues.some((v) => filterValues.includes(v));
		},
		enableSorting: false,
	},
	{
		accessorKey: 'status',
		meta: { title: i18n.global.t('del_alert_settings_table.status') },
		header: ({ column }) =>
			h(DataTableColumnHeader, {
				column: column as any,
				title: i18n.global.t('del_alert_settings_table.status'),
			}),

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
		enableSorting: true,
	},
	{
		accessorKey: 'active_dates',
		meta: { title: i18n.global.t('del_alert_settings_table.active_dates') },
		header: ({ column }) =>
			h(DataTableColumnHeader, {
				column: column as any,
				title: i18n.global.t('del_alert_settings_table.active_dates'),
			}),

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
		meta: { title: i18n.global.t('del_alert_settings_table.active_hours') },
		header: ({ column }) =>
			h(DataTableColumnHeader, {
				column: column as any,
				title: i18n.global.t('del_alert_settings_table.active_hours'),
			}),
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
		meta: { title: i18n.global.t('del_alert_settings_table.trigger_values') },
		header: ({ column }) =>
			h(DataTableColumnHeader, {
				column: column as any,
				title: i18n.global.t('del_alert_settings_table.trigger_values'),
			}),
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
		meta: { title: i18n.global.t('del_alert_settings_table.created_by') },
		header: ({ column }) =>
			h(DataTableColumnHeader, {
				column: column as any,
				title: i18n.global.t('del_alert_settings_table.created_by'),
			}),
		cell: ({ row }) => {
			const creator = row.getValue('created_by') as string;
			const valueToDisplay = creator ? creator.split('-')[0] : '';
			return h('div', { class: 'w-20' }, valueToDisplay);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
	},
];
