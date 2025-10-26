import { CreateDeliveryAlertSettings } from '../../src/alertSettingsLogic';
import { expect, jest, test, describe, beforeEach, afterEach } from '@jest/globals';

describe('addToSchedule', () => {
	let manager: CreateDeliveryAlertSettings;

	let mockHandleAlertSetting: jest.SpiedFunction<typeof manager.handleAlertSetting>;
	let mockRemoveFromSchedule: jest.SpiedFunction<typeof manager.removeFromSchedule>;

	beforeEach(() => {
		jest.useFakeTimers(); // important for testing setTimeout
		manager = new CreateDeliveryAlertSettings();

		mockHandleAlertSetting = jest
			.spyOn(manager, 'handleAlertSetting')
			.mockResolvedValue(undefined as never);

		mockRemoveFromSchedule = jest.spyOn(manager, 'removeFromSchedule').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.useRealTimers();
		jest.clearAllMocks();
	});

	test('warns and returns if alert not found', async () => {
		const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
		await manager.addToSchedule('missing-id');

		expect(warnSpy).toHaveBeenCalledWith('addToSchedule: No alert found for missing-id');
		expect(mockRemoveFromSchedule).not.toHaveBeenCalled();
		expect(mockHandleAlertSetting).not.toHaveBeenCalled();
	});

	test('warns and returns if interval is invalid', async () => {
		const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
		manager.activeAlerts.set('alert-1', {
			delivery_alert_setting_id: 'alert-1',
			description: 'Test Alert',
			vehicles: ['no-interval-test-vehicle'],
			type: 'high_temperature',
			active_hours: [{ to: '14:00', from: '09:00' }],
			receivers: [
				{
					email: 'test@mail.com',
					origin: 'custom',
					originId: null,
					phoneNumber: '',
					receiverName: 'Alert-1',
				},
			],
			alert_interval_minutes: null,
			active_dates: [{ to: '2025-10-30', from: '2025-10-06' }],
			created_at: '2025-10-13 12:19:41.957343',
			status: 'active',
			trigger_values: { max: 10, min: null },
		} as any);

		await manager.addToSchedule('alert-1');

		expect(warnSpy).toHaveBeenCalledWith('addToSchedule: Invalid interval for alert-1');
		expect(mockRemoveFromSchedule).not.toHaveBeenCalled();
		expect(mockHandleAlertSetting).not.toHaveBeenCalled();
	});

	test('schedules timeout and calls handleAlertSetting', async () => {
		const alert = {
			delivery_alert_setting_id: 'alert-2',
			description: 'T2 Alert',
			vehicles: ['T2-vehicle'],
			type: 'high_temperature',
			active_hours: [{ to: '14:00', from: '09:00' }],
			receivers: [
				{
					email: 'test.2@mail.com',
					origin: 'custom',
					originId: null,
					phoneNumber: '',
					receiverName: 'Test-2',
				},
			],
			alert_interval_minutes: 1,
			active_dates: [{ to: '2025-11-13', from: '2025-10-06' }],
			created_at: '2025-10-13 12:19:41.957343',
			status: 'active',
			trigger_values: { max: 10, min: null },
		} as any;

		manager.activeAlerts.set('alert-2', alert);

		const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

		await manager.addToSchedule('alert-2');

		// confirm proper scheduling
		expect(mockRemoveFromSchedule).toHaveBeenCalledWith('alert-2');
		expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
		expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 60_000);

		// confirm handler runs
		expect(mockHandleAlertSetting).toHaveBeenCalledWith(alert);

		// confirm scheduled map updated
		expect(manager.scheduled.has('alert-2')).toBe(true);

		// simulate the timeout callback to confirm recursion
		const scheduledTimeout = manager.scheduled.get('alert-2');
		expect(scheduledTimeout).toBeDefined();

		// Run the timeout to trigger re-scheduling
		jest.runOnlyPendingTimers();
		expect(setTimeoutSpy).toHaveBeenCalledTimes(2); // second recursive schedule
	});
});
