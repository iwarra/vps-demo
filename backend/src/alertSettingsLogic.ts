import { supabase } from './supabase.js';
import dotenv from 'dotenv';
import type { Alert, Validator, AlertSettingId, DeliveryAlertLog } from './types';
import {
	createAlertLog,
	fetchLatestTemperature,
	separateContacts,
} from './utils/deliveryAlertSetting.js';
dotenv.config();

export class CreateDeliveryAlertSettings {
	activeAlerts: Map<AlertSettingId, Alert> = new Map(); //save all alerts, not just ids to be able to get data without fetching again
	forToday: Set<AlertSettingId> = new Set();
	forThisHour: Set<AlertSettingId> = new Set();
	scheduled: Map<AlertSettingId, ReturnType<typeof setTimeout>> = new Map(); //key: alertSettingId, value: timeoutId

	private remainderForToday = 0;
	private remainderForThisHour = 0;

	async markAlertAsSent(settingId: string): Promise<void> {
		try {
			const { error } = await supabase
				.from('delivery_alert_logs')
				.update({ sent: true, sent_at: new Date().toISOString() })
				.eq('delivery_alert_setting_id', settingId);

			if (error) throw error;
		} catch (err) {
			console.error('Failed updating alert log as sent:', err);
		}
	}

	async isAlreadyAlerted(alertSetting: Alert): Promise<boolean> {
		try {
			const { data, error } = await supabase
				.from('delivery_alert_logs')
				.select('delivery_alert_log_id, sent_at, sent')
				.eq('delivery_alert_setting_id', alertSetting.delivery_alert_setting_id)
				.eq('alert_type', alertSetting.type)
				.eq('sent', true)
				.order('sent_at', { ascending: false }) //latest sent alert
				.limit(1);

			if (error) throw error;
			if (!data || data.length === 0) return false;
			return true;
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
	async sendAlert(alertSetting: Alert) {
		if (!alertSetting.receivers) return;
		const { emails, phoneNumbers } = separateContacts(alertSetting.receivers);
		try {
			//Sending SMS alerts can be added to promise later on
			//TODO add proper params here
			const results = await Promise.allSettled(
				emails.map((email) => this.sendEmailAlert(email, 'subject', 'email text')),
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
	async handleAlertSetting(alertSetting: Alert): Promise<void> {
		let alertLogCreated = false;
		let alertLog: DeliveryAlertLog | null = null; // rewrite supabase data after sending to DB - useful to have for sending alert info
		let alertTriggered = false;
		const { type, trigger_values: condition } = alertSetting;

		const checkTemperature = async (
			type: string,
			condition: { min?: number; max?: number } | null,
		) => {
			const temperature = await fetchLatestTemperature();
			let triggered = false;
			if (!temperature || !condition || !type) return false;
			if (type === 'low_temperature' && condition.min != null && temperature < condition.min) {
				triggered = true;
			} else if (
				type === 'high_temperature' &&
				condition.max != null &&
				temperature > condition.max
			) {
				triggered = true;
			} else {
				triggered = false;
				return false;
			}
			if (triggered) {
				alertLog = await createAlertLog(alertSetting, temperature);
				alertLogCreated = true;
			}
			return triggered;
		};
		try {
			if (type === 'low_temperature' || type === 'high_temperature') {
				alertTriggered = await checkTemperature(type, {
					min: condition.min ?? undefined,
					max: condition.max ?? undefined,
				});
			}
			if (!alertTriggered) return;

			if (alertLogCreated && alertTriggered) {
				const alreadyAlerted = await this.isAlreadyAlerted(alertSetting);
				if (!alreadyAlerted) {
					await this.sendAlert(alertSetting);
					await this.markAlertAsSent(alertSetting.delivery_alert_setting_id);
				}
			}
		} catch (err) {
			console.error('Error in handleAlertSetting:', err);
		}
	}

	async sortBy(setting: Alert, conditions: Validator[]): Promise<void> {
		for (const condition of conditions) {
			if (condition == 'hasActiveDates') {
				const now = new Date();
				// Normalize hours to local midnight to avoid timezone issues
				now.setHours(0, 0, 0, 0);
				const hasActiveDates = (setting.active_dates ?? []).some((range) => {
					const to = new Date(range.to);
					if (!to) return false;
					to.setHours(0, 0, 0, 0);
					return !isNaN(to.getTime()) && to >= now;
				});
				if (hasActiveDates) {
					this.activeAlerts.set(setting.delivery_alert_setting_id, setting);
				} else {
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
				}
			} else if (condition === 'isActiveToday') {
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				if (setting.active_dates) {
					const isActiveToday = setting.active_dates.some((range) => {
						const fromDate = new Date(range.from);
						const toDate = new Date(range.to);
						fromDate.setHours(0, 0, 0, 0);
						toDate.setHours(0, 0, 0, 0);
						return fromDate <= today && toDate >= today;
					});
					if (isActiveToday) {
						this.forToday.add(setting.delivery_alert_setting_id);
					}
				}
			} else if (condition === 'isActiveThisHour') {
				const now = new Date();
				const currentHour = now.getHours();
				const transformTimeRangesToHours = (alertHourRanges: { from: string; to: string }[]) => {
					const hours = new Set();

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

				const checkForCurrentHour = (alertHourRanges: { to: string; from: string }[]): boolean => {
					const allActiveHours = transformTimeRangesToHours(alertHourRanges).has(currentHour);
					return allActiveHours;
				};
				if (setting.active_hours && checkForCurrentHour(setting.active_hours)) {
					this.forThisHour.add(setting.delivery_alert_setting_id);
				}
			}
		}
	}

	async addToSchedule(alertSettingId: AlertSettingId): Promise<void> {
		const alert = this.activeAlerts.get(alertSettingId) as Alert | undefined;
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

	//TODO: set as private?
	async fetchActiveDeliveryAlertSettings(): Promise<Alert[]> {
		try {
			const { data, error } = await supabase
				.from('delivery_alert_settings')
				.select('*')
				.eq('status', 'active');
			if (error) throw error;
			return data as Alert[];
		} catch (error) {
			console.error('Error fetching alert settings:', error);
			return [];
		}
	}

	async rebuild(): Promise<void> {
		//TODO: create a helper
		for (const alertSettingId of this.scheduled.keys()) {
			this.removeFromSchedule(alertSettingId);
		}
		this.forThisHour.clear();
		this.forToday.clear();
		this.activeAlerts.clear();
		const allActiveAlerts = await this.fetchActiveDeliveryAlertSettings();
		for (const alert of allActiveAlerts) {
			await this.sortBy(alert, ['hasActiveDates', 'isActiveToday', 'isActiveThisHour']);
		}
		for (const alertId of this.forThisHour) {
			await this.addToSchedule(alertId);
		}
	}

	async rebuildForThisHour(): Promise<void> {
		for (const alertSettingId of this.scheduled.keys()) {
			this.removeFromSchedule(alertSettingId);
		}

		for (const alertId of this.forToday) {
			const alert = this.activeAlerts.get(alertId);
			if (alert) {
				await this.sortBy(alert, ['isActiveThisHour']);
			}
		}

		for (const alertId of this.forThisHour) {
			await this.addToSchedule(alertId);
		}
	}
}
