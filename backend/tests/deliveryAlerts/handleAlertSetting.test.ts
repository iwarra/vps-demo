jest.mock('../../src/utils/deliveryAlertSetting');
import * as helpers from '../../src/utils/deliveryAlertSetting';
import { CreateDeliveryAlertSettings } from '../../src/alertSettingsLogic';
import { createAlertLog, fetchLatestTemperature } from '../../src/utils/deliveryAlertSetting';
import { expect, jest, test, describe, beforeEach, afterEach } from '@jest/globals';

describe('handleAlertSetting()', () => {
	let manager: CreateDeliveryAlertSettings;

	const mockedCreateAlertLog = helpers.createAlertLog as jest.MockedFunction<
		typeof helpers.createAlertLog
	>;
	const mockedFetchLatestTemperature = helpers.fetchLatestTemperature as jest.MockedFunction<
		typeof helpers.fetchLatestTemperature
	>;

	beforeEach(() => {
		jest.clearAllMocks();
		manager = new CreateDeliveryAlertSettings();
		mockedFetchLatestTemperature.mockResolvedValue(15);
		mockedCreateAlertLog.mockResolvedValue({
			delivery_alert_log_id: 'test-log-1',
			vehicle_id: 'vehicle-1',
			created_at: '2025-10-09T08:45:50.314223',
			sent: null,
			receivers: [
				{
					email: 'receiver@mail.com',
					origin: 'custom',
					originId: '1',
					phoneNumber: '',
					receiverName: 'Test R',
				},
			],
			sent_at: null,
			alert_type: 'high_temperature',
			delivery_alert_setting_id: 'a1',
			metric_value: null,
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('triggers alert and sends email when temp > max', async () => {
		//Mocking internal methods
		jest.spyOn(manager, 'isAlreadyAlerted').mockResolvedValue(false);
		jest.spyOn(manager, 'sendAlert').mockResolvedValue();
		jest.spyOn(manager, 'markAlertAsSent').mockResolvedValue();
		const deliveryAlertSetting = {
			delivery_alert_setting_id: 'a1',
			active_dates: [{ to: '2025-10-30', from: '2025-10-06' }],
			description: 'Test Alert 1',
			vehicles: ['vehicle-1'],
			type: 'high_temperature',
			active_hours: [{ to: '21:00', from: '09:00' }],
			receivers: [
				{
					email: 'a@example.com',
					origin: 'custom',
					originId: null,
					phoneNumber: '',
					receiverName: 'a',
				},
				{
					email: 'a@example.com',
					origin: 'custom',
					originId: null,
					phoneNumber: '',
					receiverName: 'b',
				},
			],
			alert_interval_minutes: 2,
			created_at: '2025-10-13 12:19:41.727059',
			status: 'active',
			trigger_values: { max: 10, min: null },
		};
		await manager.handleAlertSetting(deliveryAlertSetting);

		expect(fetchLatestTemperature).toHaveBeenCalled();
		expect(createAlertLog).toHaveBeenCalledWith(deliveryAlertSetting, 15);
		expect(manager.sendAlert).toHaveBeenCalledWith(deliveryAlertSetting);
		expect(manager.markAlertAsSent).toHaveBeenCalledWith('a1');
	});

	test('triggers alert and sends email when temp < min', async () => {
		//Mocking internal methods
		jest.spyOn(manager, 'isAlreadyAlerted').mockResolvedValue(false);
		jest.spyOn(manager, 'sendAlert').mockResolvedValue();
		jest.spyOn(manager, 'markAlertAsSent').mockResolvedValue();
		const deliveryAlertSetting = {
			delivery_alert_setting_id: 'a2',
			active_dates: [{ to: '2025-10-30', from: '2025-10-06' }],
			description: 'Test Alert 1',
			vehicles: ['vehicle-1'],
			type: 'low_temperature',
			active_hours: [{ to: '21:00', from: '09:00' }],
			receivers: [
				{
					email: 'a@example.com',
					origin: 'custom',
					originId: null,
					phoneNumber: '',
					receiverName: 'a',
				},
			],
			alert_interval_minutes: 2,
			created_at: '2025-10-13 12:19:41.727059',
			status: 'active',
			trigger_values: { max: null, min: 16 },
		};
		await manager.handleAlertSetting(deliveryAlertSetting);

		expect(fetchLatestTemperature).toHaveBeenCalled();
		expect(createAlertLog).toHaveBeenCalledWith(deliveryAlertSetting, 15);
		expect(manager.sendAlert).toHaveBeenCalledWith(deliveryAlertSetting);
		expect(manager.markAlertAsSent).toHaveBeenCalledWith('a2');
	});

	test('does not trigger when temperature is in range', async () => {
		jest.spyOn(manager, 'isAlreadyAlerted').mockResolvedValue(false);
		jest.spyOn(manager, 'sendAlert').mockResolvedValue();
		jest.spyOn(manager, 'markAlertAsSent').mockResolvedValue();
		const mockedSeparateContacts = jest.fn(() => ({
			emails: ['a@example.com'],
			phoneNumbers: [],
		}));
		(helpers as any).separateContacts = mockedSeparateContacts;

		const deliveryAlertSetting = {
			delivery_alert_setting_id: 'a3',
			active_dates: [{ to: '2025-10-30', from: '2025-10-06' }],
			description: 'Test Alert 1',
			vehicles: ['vehicle-1'],
			type: 'low_temperature',
			active_hours: [{ to: '21:00', from: '09:00' }],
			receivers: [
				{
					email: 'a@example.com',
					origin: 'custom',
					originId: null,
					phoneNumber: '',
					receiverName: 'a',
				},
			],
			alert_interval_minutes: 2,
			created_at: '2025-10-13 12:19:41.727059',
			status: 'active',
			trigger_values: { max: 20, min: 10 },
		};

		await manager.handleAlertSetting(deliveryAlertSetting);

		// Nothing should have been called
		expect(createAlertLog).not.toHaveBeenCalled();
		expect(manager.sendAlert).not.toHaveBeenCalled();
		expect(manager.markAlertAsSent).not.toHaveBeenCalled();
	});

	test('handles errors gracefully', async () => {
		const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
		mockedFetchLatestTemperature.mockRejectedValue(new Error('API down'));

		const delAlertSetting = {
			delivery_alert_setting_id: 'a4',
			active_dates: [{ to: '2025-10-30', from: '2025-10-06' }],
			description: 'Test Alert 4',
			vehicles: ['vehicle-4'],
			type: 'low_temperature',
			active_hours: [{ to: '21:00', from: '09:00' }],
			receivers: [
				{
					email: 'a@example.com',
					origin: 'custom',
					originId: null,
					phoneNumber: '',
					receiverName: 'a',
				},
			],
			alert_interval_minutes: 2,
			created_at: '2025-10-13 12:19:41.727059',
			status: 'active',
			trigger_values: { max: 10, min: 20 },
		};

		await manager.handleAlertSetting(delAlertSetting);

		expect(consoleSpy).toHaveBeenCalledWith('Error in handleAlertSetting:', expect.any(Error));
	});
});
