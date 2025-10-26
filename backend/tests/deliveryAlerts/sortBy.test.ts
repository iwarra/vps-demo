import { CreateDeliveryAlertSettings } from '../../src/alertSettingsLogic';
import { jest, describe, test, beforeEach, expect } from '@jest/globals';

describe('sorting by conditions passed', () => {
	let manager: CreateDeliveryAlertSettings;

	beforeEach(() => {
		jest.clearAllMocks();
		manager = new CreateDeliveryAlertSettings();
	});

	test('adds alert setting to activeAlerts if it has active date/s', async () => {
		const today = new Date();
		const future = new Date(today);
		future.setDate(today.getDate() + 1);

		const deliveryAlertSetting = {
			delivery_alert_setting_id: 'a1',
			active_dates: [{ from: today.toISOString(), to: future.toISOString() }],
			description: 'Test Alert 1',
			vehicles: ['41d7f51c-eef9-488b-a13a-60245c50fa47', '9180b59b-7bc1-41b6-b6f5-bdee830c1ba2'],
			type: 'high_temperature',
			active_hours: [{ to: '21:00', from: '09:00' }],
			receivers: [
				{
					email: 'test@mail.com',
					origin: 'custom',
					originId: null,
					phoneNumber: '',
					receiverName: 'R1',
				},
			],
			alert_interval_minutes: 2,
			created_at: '2025-10-13 12:19:41.727059',
			status: 'active',
			trigger_values: { max: 10, min: null },
		};

		const result = await manager.sortBy(deliveryAlertSetting, ['hasActiveDates']);
		expect(result).toBe(true);
		expect(manager.activeAlerts.has('a1')).toBe(true);
	});

	test('adds alert to forToday if active today', async () => {
		const todayStr = new Date().toISOString().split('T')[0];
		console.log(todayStr);

		const alertSetting = {
			delivery_alert_setting_id: 'a2',
			active_dates: [{ from: todayStr, to: todayStr }],
			description: 'Test Alert 2',
			vehicles: ['41d7f51c-eef9-488b-a13a-60245c50fa47', '9180b59b-7bc1-41b6-b6f5-bdee830c1ba2'],
			type: 'high_temperature',
			active_hours: [{ to: '21:00', from: '09:00' }],
			receivers: [
				{
					email: 'test2@gmail.com',
					origin: 'custom',
					originId: null,
					phoneNumber: '',
					receiverName: 'R2',
				},
			],
			alert_interval_minutes: 2,
			created_at: '2025-10-13 12:19:41.727059',
			status: 'active',
			trigger_values: { max: 10, min: null },
		};

		const result = await manager.sortBy(alertSetting as any, ['isActiveToday']);
		expect(result).toBe(true);
		expect(manager.forToday.has('a2')).toBe(true);
	});

	test('adds alert to forThisHour if active this hour', async () => {
		const now = new Date();
		const currentHour = now.getHours();
		const nextHour = (currentHour + 1) % 24;

		const alertSetting = {
			delivery_alert_setting_id: 'a3',
			active_hours: [{ from: `${currentHour}:00`, to: `${nextHour}:00` }],
			description: 'Test Alert 3',
			vehicles: ['41d7f51c-eef9-488b-a13a-60245c50fa47', '9180b59b-7bc1-41b6-b6f5-bdee830c1ba2'],
			type: 'high_temperature',
			receivers: [
				{
					email: 'test3@gmail.com',
					origin: 'custom',
					originId: null,
					phoneNumber: '',
					receiverName: 'R3',
				},
			],
			alert_interval_minutes: 2,
			active_dates: [{ to: '2026-10-30', from: '2025-10-06' }],
			created_at: '2025-10-13 12:19:41.727059',
			status: 'active',
			trigger_values: { max: 10, min: null },
		};

		const result = await manager.sortBy(alertSetting as any, ['isActiveThisHour']);
		expect(result).toBe(true);
		expect(manager.forThisHour.has('a3')).toBe(true);
	});

	test('marks alert as expired in DB if no active dates', async () => {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		const twoDaysAgo = new Date();
		twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

		const expiredAlert = {
			delivery_alert_setting_id: 'a4',
			active_dates: [{ from: twoDaysAgo.toISOString(), to: yesterday.toISOString() }],
			description: 'Expired Alert',
			vehicles: ['41d7f51c-eef9-488b-a13a-60245c50fa47'],
			type: 'high_temperature',
			receivers: [{ email: 'ikaikaca22@gmail.com', receiverName: 'Ika' }],
			alert_interval_minutes: 2,
			created_at: '2025-10-13 12:19:41.727059',
			status: 'active',
			trigger_values: { max: 10, min: null },
		};

		const result = await manager.sortBy(expiredAlert as any, ['hasActiveDates']);

		expect(result).toBe(false);
	});
});
