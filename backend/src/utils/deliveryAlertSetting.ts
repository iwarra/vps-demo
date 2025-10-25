import type { Receiver, DelAlertSetting } from '../types.ts';
import { supabase } from '../supabase.ts';
import { Database, Json } from '../../database.types.ts';
type AlertLog = Database['public']['Tables']['delivery_alert_logs']['Row'];

export async function createAlertLog(
	alertSetting: DelAlertSetting,
	metricTrigger: number,
	alertType: string,
): Promise<AlertLog | null> {
	try {
		console.log('In create alert log with this data: ', alertSetting, metricTrigger, alertType);
		const { data, error } = await supabase
			.from('delivery_alert_logs')
			.upsert({
				vehicle_id: alertSetting.vehicles
					? alertSetting.vehicles[0]
					: '9180b59b-7bc1-41b6-b6f5-bdee830c1ba2',
				receivers: alertSetting.receivers as unknown as Json,
				alert_type: alertSetting.type === 'temperature' ? alertType : alertSetting.type,
				delivery_alert_setting_id: alertSetting.delivery_alert_setting_id,
				metric_value: Math.round(metricTrigger),
			})
			.select();

		if (error) throw error;
		//TODO: Handle error so alert isn't sent on every trigger
		return data?.[0];
	} catch (err) {
		console.error('Failed creating alert log:', err);
		return null;
	}
}

//Helper for testing purposes
export async function fetchLatestTemperature(): Promise<number | null> {
	try {
		const { data, error } = await supabase
			.from('weather_readings')
			.select('temperature_c')
			.order('created_at', { ascending: false })
			.limit(1);

		if (error) throw error;
		if (!data || data.length === 0) return null;

		return data[0] ? Number(data[0].temperature_c) : null;
	} catch (err) {
		console.error('Failed fetching temperature:', err);
		return null;
	}
}

export function separateContacts(deliveryAlertReceivers: Receiver[]) {
	const emails: string[] = [];
	const phoneNumbers: string[] = [];

	for (const r of deliveryAlertReceivers) {
		if (r.email) emails.push(r.email);
		if (r.phoneNumber) phoneNumbers.push(r.phoneNumber);
	}

	return { emails, phoneNumbers };
}

export function normalizeDeliveryAlertSetting(
	row: Database['public']['Tables']['delivery_alert_settings']['Row'],
): DelAlertSetting {
	return {
		...row,
		receivers: (row.receivers as Receiver[] | null) ?? null,
		active_dates: (row.active_dates as { from: string; to: string }[] | null) ?? null,
		active_hours: (row.active_hours as { from: string; to: string }[] | null) ?? null,
		trigger_values:
			(row.trigger_values as { min: number | null; max: number | null } | null) ?? null,
	};
}
