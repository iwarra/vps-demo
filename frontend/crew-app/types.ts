import type { Database } from './database.types.ts';
export type DateRange = { from: string; to: string };
export type HourRange = { from: string; to: string };
export type TriggerValues = { min: number | null; max: number | null };

export type DelAlertSetting = Omit<
	Database['public']['Tables']['delivery_alert_settings']['Row'],
	'receivers' | 'active_dates' | 'active_hours' | 'trigger_values'
> & {
	receivers: Receiver[] | null;
	active_dates: DateRange[] | null;
	active_hours: HourRange[] | null;
	trigger_values: TriggerValues | null;
};

export type VehicleInfo = {
	id: string;
	registration: string;
};

export interface Receiver {
	receiverName: string;
	phoneNumber?: string;
	email?: string;
	origin?: 'driver' | 'customer' | 'custom' | undefined;
	originId?: string | number; // e.g., driver user_id or customer_location_id
	contactSms: boolean;
	contactEmail: boolean;
}

export interface Selection {
	receiverName: string;
	phoneNumber?: string;
	email?: string;
	contactSms: boolean;
	contactEmail: boolean;
	origin: 'driver' | 'customer';
	originId: number | string;
}

export interface Driver {
	id: string;
	displayName?: string;
	phoneNumber?: string;
	email?: string;
}

export interface Customer {
	id: string;
	name?: string;
}

export interface CustomerLocation {
	id: string;
	name: string;
	contactPerson: string;
	phoneNumber?: string;
	email?: string;
}
