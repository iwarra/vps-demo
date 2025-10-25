import { supabase } from './supabase.ts';
import dotenv from 'dotenv';
import type { Validator, AlertSettingId, DelAlertSetting } from './types.ts';
import {
	createAlertLog,
	fetchLatestTemperature,
	normalizeDeliveryAlertSetting,
	separateContacts,
} from './utils/deliveryAlertSetting.ts';
dotenv.config();
import type { Database } from '../database.types.ts';
type AlertLog = Database['public']['Tables']['delivery_alert_logs']['Row'];

export class CreateDeliveryAlertSettings {
	activeAlerts: Map<AlertSettingId, DelAlertSetting> = new Map(); //save all alerts, not just ids to be able to get data without fetching again
	forToday: Set<AlertSettingId> = new Set();
	forThisHour: Set<AlertSettingId> = new Set();
	scheduled: Map<AlertSettingId, ReturnType<typeof setTimeout>> = new Map(); //key: alertSettingId, value: timeoutId

	private remainderForToday = 0;
	private remainderForThisHour = 0;

	async markAlertAsSent(delAlertSettingId: string, alertLogType: string): Promise<void> {
		try {
			const { data: latestLog, error: errorFetchingLatestLog } = await supabase
				.from('delivery_alert_logs')
				.select('delivery_alert_log_id')
				.eq('delivery_alert_setting_id', delAlertSettingId)
				.eq('alert_type', alertLogType)
				.order('created_at', { ascending: false })
				.limit(1)
				.single();

			if (errorFetchingLatestLog) {
				console.error('Error fetching latest log:', errorFetchingLatestLog);
			} else if (latestLog) {
				const { error: updateError } = await supabase
					.from('delivery_alert_logs')
					.update({ sent: true, sent_at: new Date().toISOString() })
					.eq('delivery_alert_log_id', latestLog.delivery_alert_log_id);

				if (updateError) {
					console.error('Error updating latest log:', updateError);
				}
			}
		} catch (err) {
			console.error('Failed updating alert log as sent:', err);
		}
	}

	async isAlreadyAlerted(alertSettingId: string, alertLogType: string): Promise<boolean> {
		try {
			const { data, error } = await supabase
				.from('delivery_alert_logs')
				.select('delivery_alert_log_id, sent_at, sent, alert_type')
				.eq('delivery_alert_setting_id', alertSettingId)
				.eq('sent', true)
				.eq('alert_type', alertLogType)
				.order('sent_at', { ascending: false }) //latest sent alert
				.limit(1);

			if (error) throw error;
			return data && data.length > 0; // Returns true if at least one matching alert exists
		} catch (error) {
			console.error('Failed checking alert history:', error);
			return false; // Fail-safe: treat as not alerted to allow retry
		}
	}

	//TODO: Refactor to take the whole alert log?
	async sendEmailAlert(email: string, subject: string, text: string): Promise<Response> {
		try {
			const response = await fetch('https://api.resend.com/emails', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					from: 'mervin@kwik.se',
					to: email,
					subject,
					html: `<p>${text}</p>`,
				}),
			});

			if (!response.ok) {
				const errText = await response.text();
				console.error('Resend API error:', errText);
				return new Response(errText, { status: response.status });
			}
			return response;
		} catch (error) {
			console.error('Error sending delivery alert email:', error);
			return new Response('Send delivery alert email failed', { status: 500 });
		}
	}

	//TODO: how to handle emails not being sent - through return, posthog?
	async sendAlert(alertSetting: DelAlertSetting) {
		if (!alertSetting.receivers) return;
		const { emails, phoneNumbers } = separateContacts(alertSetting.receivers);
		try {
			//Sending SMS alerts can be added to promise later on
			//TODO add proper params here
			const results = await Promise.allSettled(
				emails.map((email: string) => this.sendEmailAlert(email, 'subject', 'email text')),
			);
			const failures: (PromiseFulfilledResult<{ ok: boolean }> | PromiseRejectedResult)[] =
				results.filter(
					(r) => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.ok === false),
				);
			if (failures.length > 0) {
				console.error('Some email alerts failed:', failures);
			}
		} catch (error) {
			console.error('Error sending alert email:', error);
		}
	}

	//TODO: Do we need a return?
	async handleAlertSetting(alertSetting: DelAlertSetting): Promise<void> {
		let alertLogCreated = false;
		let alertLog: AlertLog | null = null; // rewrite supabase data after sending to DB - useful to have for sending alert info
		let alertTriggered = false;
		const { type, trigger_values: condition } = alertSetting;
		let alertLogType: string = '';

		console.log('The alert setting type: ', type);
		const checkTemperature = async (condition: { min?: number; max?: number } | null) => {
			const temperature = await fetchLatestTemperature();
			let triggered = false;
			if (!temperature || !condition) return false;
			console.log('Starting the handler with this condition: ', condition);
			if (condition.min && temperature < condition.min) {
				alertLogType = 'low_temperature';
				//console.log('Setting min_temp: ', alertLogType, condition.min);
				triggered = true;
			} else if (condition.max && temperature > condition.max) {
				alertLogType = 'high_temperature';
				//console.log('Setting max_temp: ', alertLogType, condition.max);
				triggered = true;
			} else {
				triggered = false;
				return false;
			}
			if (triggered && alertLogType !== '') {
				console.log('After empty string check');
				alertLog = await createAlertLog(alertSetting, temperature, alertLogType);
				alertLogCreated = true;
			}
			return triggered;
		};
		try {
			if (type === 'temperature') {
				alertTriggered = await checkTemperature({
					min: condition?.min ?? undefined,
					max: condition?.max ?? undefined,
				});
				console.log('Trigger check for temp type: ', alertTriggered, ' for ', alertLogType);
			}
			if (!alertTriggered) return;

			if (alertLogCreated && alertTriggered) {
				const delAlertSettingId = alertSetting.delivery_alert_setting_id;
				const alreadyAlerted = await this.isAlreadyAlerted(delAlertSettingId, alertLogType);
				console.log('Is it already alerted: ', alreadyAlerted);
				if (!alreadyAlerted) {
					await this.sendAlert(alertSetting);
					await this.markAlertAsSent(delAlertSettingId, alertLogType);
				}
			}
		} catch (err) {
			console.error('Error in handleAlertSetting:', err);
		}
	}

	async sortBy(setting: DelAlertSetting, conditions: Validator[]): Promise<boolean> {
		if (typeof setting !== 'object') return false;
		for (const condition of conditions) {
			if (condition == 'hasActiveDates') {
				const now = new Date();
				// Normalize hours to local midnight to avoid timezone issues
				now.setHours(0, 0, 0, 0);
				const hasActiveDates = (setting.active_dates ?? []).some((range) => {
					if (!range?.to) return false;
					const to = new Date(range.to);
					to.setHours(0, 0, 0, 0);
					return !isNaN(to.getTime()) && to >= now;
				});
				if (!hasActiveDates) {
					//mark the alert as expired in DB
					try {
						const { error } = await supabase
							.from('delivery_alert_settings')
							.update({ status: 'expired' })
							.eq('delivery_alert_setting_id', setting.delivery_alert_setting_id);
						//TODO log error to some fs file
						if (error) console.error('Failed to mark alert setting expired:', error);
					} catch (err) {
						console.error('Unexpected error while marking expired:', err);
					}
					return false;
				}
				this.activeAlerts.set(setting.delivery_alert_setting_id, setting);
			} else if (condition === 'isActiveToday') {
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				const isActiveToday = (setting.active_dates ?? []).some(
					(range: { from: string; to: string }) => {
						if (!range?.from || !range?.to) return false;
						const fromDate = new Date(range.from);
						const toDate = new Date(range.to);
						fromDate.setHours(0, 0, 0, 0);
						toDate.setHours(0, 0, 0, 0);
						return (
							!isNaN(fromDate.getTime()) &&
							!isNaN(toDate.getTime()) &&
							fromDate <= today &&
							toDate >= today
						);
					},
				);
				if (!isActiveToday) return false;
				this.forToday.add(setting.delivery_alert_setting_id);
			} else if (condition === 'isActiveThisHour') {
				const now = new Date();
				const currentHour = now.getHours();

				const transformTimeRangesToHours = (alertHourRanges: { from: string; to: string }[]) => {
					const hours = new Set<number>();

					alertHourRanges.forEach((range) => {
						const [fromHour, fromMinute] = range.from.split(':').map(Number);
						const [toHour, toMinute] = range.to.split(':').map(Number);
						hours.add(fromHour);
						let h = fromHour;
						// include toHour only if toMinute > 0, handle wrap-around from 23 to 0
						while (h !== undefined) {
							h = (h + 1) % 24;
							if (h === toHour) {
								if (toMinute !== undefined && toMinute > 0) hours.add(h);
								break;
							}
							hours.add(h);
							if (hours.size > 24) break; // safety guard
						}
					});
					return hours;
				};
				const isActiveAtCurrentHour = setting.active_hours
					? transformTimeRangesToHours(setting.active_hours).has(currentHour)
					: false;
				if (!isActiveAtCurrentHour) return false;
				this.forThisHour.add(setting.delivery_alert_setting_id);
			}
		}
		return true;
	}

	async addToSchedule(alertSettingId: AlertSettingId): Promise<void> {
		const alert = this.activeAlerts.get(alertSettingId) as DelAlertSetting | undefined;
		let intervalMs;
		if (!alert) {
			console.warn(`addToSchedule: No alert found for ${alertSettingId}`);
			return;
		}
		if (alert.alert_interval_minutes) {
			intervalMs = alert.alert_interval_minutes * 60_000;
		}
		if (!intervalMs) {
			console.warn(`addToSchedule: Invalid interval for ${alertSettingId}`);
			return;
		}
		this.removeFromSchedule(alert.delivery_alert_setting_id);

		const timeout = setTimeout(() => {
			this.addToSchedule(alert.delivery_alert_setting_id);
		}, intervalMs);
		this.scheduled.set(alertSettingId, timeout);
		await this.handleAlertSetting(alert);
	}

	removeFromSchedule(alertSettingId: AlertSettingId): void {
		if (this.scheduled.has(alertSettingId)) {
			const timeoutId = this.scheduled.get(alertSettingId);
			clearTimeout(timeoutId);
			this.scheduled.delete(alertSettingId);
		}
	}

	removeAlertFromSystem(alertSettingId: AlertSettingId): void {
		if (this.activeAlerts.has(alertSettingId)) {
			this.activeAlerts.delete(alertSettingId);
		}
		if (this.forToday.has(alertSettingId)) {
			this.forToday.delete(alertSettingId);
		}
		if (this.forThisHour.has(alertSettingId)) {
			this.forThisHour.delete(alertSettingId);
		}
		this.removeFromSchedule(alertSettingId);
	}

	clearAll(): void {
		this.forToday.clear();
		this.forThisHour.clear();
		this.activeAlerts.clear();
		this.scheduled.clear();
	}

	//TODO: set as private
	async fetchActiveDeliveryAlertSettings(): Promise<DelAlertSetting[]> {
		try {
			const { data, error } = await supabase
				.from('delivery_alert_settings')
				.select('*')
				.eq('status', 'active')
				.or('is_deleted.is.null,is_deleted.eq.false');
			if (error) throw error;
			if (!data) return [];
			const normalized = data?.map((row) => normalizeDeliveryAlertSetting(row)) ?? [];
			return normalized;
		} catch (error) {
			console.error('Error fetching alert settings:', error);
			return [];
		}
	}

	async rebuild(): Promise<void> {
		//Clears the system, fetches active, processes and schedules
		await this.clearSchedule();
		this.forThisHour.clear();
		this.forToday.clear();
		this.activeAlerts.clear();

		const allActiveAlerts = await this.fetchActiveDeliveryAlertSettings();
		await this.processAlerts(allActiveAlerts, [
			'hasActiveDates',
			'isActiveToday',
			'isActiveThisHour',
		]);
		await this.scheduleForThisHour();
	}

	async rebuildForThisHour(): Promise<void> {
		await this.clearSchedule();

		for (const alertId of this.forToday) {
			const alert = this.activeAlerts.get(alertId);
			if (alert) {
				await this.sortBy(alert, ['isActiveThisHour']);
			}
		}

		await this.scheduleForThisHour();
	}

	// helpers:
	async clearSchedule(): Promise<void> {
		for (const alertSettingId of this.scheduled.keys()) {
			this.removeFromSchedule(alertSettingId);
		}
	}

	async scheduleForThisHour(): Promise<void> {
		for (const alertId of this.forThisHour) {
			await this.addToSchedule(alertId);
		}
	}

	async processAlerts(alerts: DelAlertSetting[], sortingCriteria: Validator[]): Promise<void> {
		for (const alert of alerts) {
			await this.sortBy(alert, sortingCriteria);
		}
	}
}
