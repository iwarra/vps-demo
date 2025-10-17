import { CreateDeliveryAlertSettings } from '../../src/alertSettingsLogic';
import { describe, test, beforeEach, expect } from '@jest/globals';

describe('sortBy()', () => {
	let manager: CreateDeliveryAlertSettings;
	beforeEach(() => {
		manager = new CreateDeliveryAlertSettings();
	});
	test('adds alert setting to activeAlerts if it has active date(s)', () => {
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
					email: 'ikaikaca22@gmail.com',
					origin: 'custom',
					originId: null,
					phoneNumber: '',
					receiverName: 'Ika',
				},
			],
			alert_interval_minutes: 2,
			created_at: '2025-10-13 12:19:41.727059',
			status: 'active',
			trigger_values: { max: 10, min: null },
		};
		manager.sortBy(deliveryAlertSetting, ['hasActiveDates']);
		expect(manager.activeAlerts.has('a1')).toBe(true);
	});

	test('adds alert to forToday if active today', () => {
		const todayStr = new Date().toISOString().split('T')[0];
		const alertSetting = {
			delivery_alert_setting_id: 'a2',
			active_dates: [{ from: todayStr, to: todayStr }],
			description: 'Test Alert 2',
			vehicles: ['41d7f51c-eef9-488b-a13a-60245c50fa47', '9180b59b-7bc1-41b6-b6f5-bdee830c1ba2'],
			type: 'high_temperature',
			active_hours: [{ to: '21:00', from: '09:00' }],
			receivers: [
				{
					email: 'ikaikaca22@gmail.com',
					origin: 'custom',
					originId: null,
					phoneNumber: '',
					receiverName: 'Ika',
				},
			],
			alert_interval_minutes: 2,
			created_at: '2025-10-13 12:19:41.727059',
			status: 'active',
			trigger_values: { max: 10, min: null },
		};

		manager.sortBy(alertSetting as any, ['isActiveToday']);
		expect(manager.forToday.has('a2')).toBe(true);
	});

	test('adds alert to forThisHour if active this hour', () => {
		const now = new Date();
		const currentHour = now.getHours();

		const alertSetting = {
			delivery_alert_setting_id: 'a3',
			active_hours: [{ from: `${currentHour}:00`, to: `${currentHour + 1}:00` }],
			description: 'Test Alert 3',
			vehicles: ['41d7f51c-eef9-488b-a13a-60245c50fa47', '9180b59b-7bc1-41b6-b6f5-bdee830c1ba2'],
			type: 'high_temperature',
			receivers: [
				{
					email: 'ikaikaca22@gmail.com',
					origin: 'custom',
					originId: null,
					phoneNumber: '',
					receiverName: 'Ika',
				},
			],
			alert_interval_minutes: 2,
			active_dates: [
				{ to: '2025-10-30', from: '2025-10-06' },
				{ to: '2025-10-07', from: '2025-10-06' },
			],
			created_at: '2025-10-13 12:19:41.727059',
			status: 'active',
			trigger_values: { max: 10, min: null },
		};

		manager.sortBy(alertSetting as any, ['isActiveThisHour']);
		expect(manager.forThisHour.has('a3')).toBe(true);
	});
});
