export type Validator = 'hasActiveDates' | 'isActiveThisHour' | 'isActiveToday'; // extend as needed
export type AlertSettingId = string | number;
export interface Alert {
	active_dates: { from: string; to: string }[] | null;
	active_hours: { from: string; to: string }[] | null;
	alert_interval_minutes: number | null;
	delivery_alert_setting_id: string;
	description: string | null;
	receivers: Receiver[] | null;
	type: string | null;
	vehicles: string[] | null;
	trigger_values: { min: number | null; max: number | null };
	created_at: string | null;
	status: string | null;
}
export interface Receiver {
	receiverName: string;
	phoneNumber: string | null;
	email: string | null;
	origin: string;
	originId: string | null;
}
export interface DeliveryAlertLog {
	alert_type: string | null;
	created_at: string | null;
	delivery_alert_log_id: string;
	delivery_alert_setting_id: string | null;
	metric_value: number | null;
	receivers: Receiver[] | null;
	sent: boolean | null;
	sent_at: string | null;
	vehicle_id: string | null;
}
