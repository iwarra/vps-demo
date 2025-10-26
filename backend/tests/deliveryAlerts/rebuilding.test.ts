import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';
import { CreateDeliveryAlertSettings } from '../../src/alertSettingsLogic';

describe('Scheduler rebuild methods', () => {
	let manager: CreateDeliveryAlertSettings;

	beforeEach(() => {
		jest.useFakeTimers();
		manager = new CreateDeliveryAlertSettings();

		// mock dependencies
		jest.spyOn(manager, 'removeFromSchedule').mockImplementation(jest.fn());
		jest
			.spyOn(manager, 'addToSchedule')
			.mockImplementation(async (alertSettingId: string | number) => {});
		jest.spyOn(manager, 'sortBy').mockResolvedValue(undefined as any);
		jest.spyOn(manager, 'fetchActiveDeliveryAlertSettings').mockResolvedValue([
			{ delivery_alert_setting_id: 'a1', type: 'high_temperature' },
			{ delivery_alert_setting_id: 'a2', type: 'low_temperature' },
			{ delivery_alert_setting_id: 'old', type: 'low_temperature' },
		] as any);
	});

	afterEach(() => {
		jest.useRealTimers();
		jest.restoreAllMocks();
	});

	test('rebuild clears old state and schedules new alerts', async () => {
		jest
			.spyOn(manager, 'fetchActiveDeliveryAlertSettings')
			.mockResolvedValue([{ delivery_alert_setting_id: 'new-1' }] as any);
		jest.spyOn(manager, 'sortBy').mockImplementation(async (alert, rules) => {
			manager.forThisHour.add(alert.delivery_alert_setting_id); // simulate sorting result
			return true;
		});
		jest.spyOn(global, 'setTimeout').mockImplementation((fn: (...args: any[]) => void) => {
			// Do nothing, just return a fake Timeout-like object
			return { ref: () => {}, unref: () => {} } as unknown as NodeJS.Timeout;
		});

		jest
			.spyOn(manager, 'addToSchedule')
			.mockImplementation(async (alertSettingId: string | number): Promise<void> => {
				manager.scheduled.set(alertSettingId, 1 as unknown as NodeJS.Timeout);
			});

		jest
			.spyOn(manager, 'removeFromSchedule')
			.mockImplementation(function (this: CreateDeliveryAlertSettings, id: string | number) {
				return CreateDeliveryAlertSettings.prototype.removeFromSchedule.call(this, id);
			}); //tests the actual method

		manager.scheduled.set(
			'old',
			setTimeout(() => {}, 1000),
		);
		manager.forToday.add('old');
		manager.forThisHour.add('old');
		manager.activeAlerts.set('old', {} as any);

		await manager.rebuild();

		// ensures old data cleared
		expect(manager.removeFromSchedule).toHaveBeenCalledWith('old');
		expect(manager.forThisHour.has('old')).toBe(false);
		expect(manager.forToday.has('old')).toBe(false);
		expect(manager.activeAlerts.has('old')).toBe(false);

		// ensures it fetched and processed alerts
		expect(manager.fetchActiveDeliveryAlertSettings).toHaveBeenCalled();
		expect(manager.sortBy).toHaveBeenCalled();

		// ensures new schedules were added
		expect(manager.addToSchedule).toHaveBeenCalledWith('new-1');
	});

	test('rebuildForThisHour only reschedules alerts active this hour', async () => {
		manager.scheduled.set(
			'old',
			setTimeout(() => {}, 1000),
		);
		manager.forToday.add('a1');
		manager.forThisHour.add('a1');
		manager.activeAlerts.set('a1', { delivery_alert_setting_id: 'a1' } as any);

		await manager.rebuildForThisHour();

		expect(manager.removeFromSchedule).toHaveBeenCalled();
		expect(manager.sortBy).toHaveBeenCalledWith(
			expect.objectContaining({ delivery_alert_setting_id: 'a1' }),
			['isActiveThisHour'],
		);
		expect(manager.addToSchedule).toHaveBeenCalledWith('a1');
	});

	test('rebuild alerts when hour changes', async () => {
		const alertA = {
			delivery_alert_setting_id: 'A',
			active_hours: [{ from: '08:00', to: '09:30' }],
			active_dates: [{ from: '2025-10-01', to: '2025-12-31' }],
		} as any;
		const alertB = {
			delivery_alert_setting_id: 'B',
			active_hours: [{ from: '09:30', to: '11:00' }],
			active_dates: [{ from: '2025-10-01', to: '2025-12-31' }],
		} as any;
		manager.activeAlerts.set('A', alertA);
		manager.activeAlerts.set('B', alertB);
		manager.forToday.add('A');
		manager.forToday.add('B');

		// Mock sortBy to simulate populating forThisHour
		jest.spyOn(manager, 'sortBy').mockImplementation(async (alert, rules) => {
			const currentHour = new Date().getUTCHours();
			if (alert.delivery_alert_setting_id === 'A' && currentHour === 9) {
				manager.forThisHour.add('A');
			}
			if (alert.delivery_alert_setting_id === 'B' && currentHour === 10) {
				manager.forThisHour.add('B');
			}
			return true;
		});

		// Spy on addToSchedule and actually insert into scheduled map
		jest.spyOn(manager, 'addToSchedule').mockImplementation(async (id) => {
			manager.scheduled.set(id, 1 as unknown as NodeJS.Timeout);
		});

		// Set time T1 = 2025-10-15T09:00:00 (should pick alert A only)
		jest.setSystemTime(new Date('2025-10-15T09:00:00Z'));
		await manager.rebuildForThisHour();

		expect(manager.sortBy).toHaveBeenCalledTimes(2);
		expect(manager.forThisHour.has('A')).toBe(true);
		expect(manager.addToSchedule).toHaveBeenCalled();
		expect(manager.scheduled.has('A')).toBe(true);
		expect(manager.scheduled.has('B')).toBe(false);

		manager.forThisHour.clear();
		manager.scheduled.clear();
		// Change to T2 = 2025-10-15T10:00:00 (should pick B only)
		jest.setSystemTime(new Date('2025-10-15T10:00:00Z'));
		await manager.rebuildForThisHour();

		expect(manager.forThisHour.has('B')).toBe(true);
		expect(manager.scheduled.has('A')).toBe(false);
		expect(manager.scheduled.has('B')).toBe(true);
	});
});
