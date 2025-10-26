import { expect, jest, test, describe, beforeEach, afterEach } from '@jest/globals';
import { CreateDeliveryAlertSettings } from '../../src/alertSettingsLogic';
import { supabase } from '../../src/supabase';

jest.mock('../../src/supabase');
const mockSupabase = jest.mocked(supabase);

describe('handleAlertSetting', () => {
	let manager: CreateDeliveryAlertSettings;
	let isAlreadyAlertedSpy: jest.SpyInstance;
	let sendAlertSpy: jest.SpyInstance;
	let markAlertAsSentSpy: jest.SpyInstance;
	let consoleLogSpy: jest.SpyInstance;
	let consoleErrorSpy: jest.SpyInstance;

	const mockAlertSetting: DelAlertSetting = {
		delivery_alert_setting_id: 'setting-123',
		type: 'temperature',
		trigger_values: { min: 5, max: 30 },
		vehicles: ['vehicle-1'],
		receivers: [],
	};
	beforeEach(() => {
		jest.clearAllMocks();
		manager = new CreateDeliveryAlertSettings();

		isAlreadyAlertedSpy = jest.spyOn(manager, 'isAlreadyAlerted').mockResolvedValue(false);
		sendAlertSpy = jest.spyOn(manager, 'sendAlert').mockResolvedValue(undefined);
		markAlertAsSentSpy = jest.spyOn(manager, 'markAlertAsSent').mockResolvedValue(undefined);
		consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
		consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
	});

	afterEach(() => {
		consoleLogSpy.mockRestore();
		consoleErrorSpy.mockRestore();
	});

	it('sends alert if temperature exceeds max and alert wasnt already sent', async () => {
		const mockSelectChain = {
			select: jest.fn().mockReturnThis(),
			order: jest.fn().mockReturnThis(),
			limit: jest.fn().mockResolvedValue({
				data: [{ temperature_c: 35 }],
				error: null,
			}),
		};
		const mockUpsertChain = {
			upsert: jest.fn().mockReturnThis(),
			select: jest.fn().mockResolvedValue({
				data: [
					{
						delivery_alert_log_id: 'log-123',
						metric_value: 35,
						alert_type: 'high_temperature',
					},
				],
				error: null,
			}),
		};
		mockSupabase.from = jest.fn((table) => {
			if (table === 'weather_readings') {
				return mockSelectChain as any;
			}
			if (table === 'delivery_alert_logs') {
				return mockUpsertChain as any;
			}
			return mockSelectChain as any;
		});
		await manager.handleAlertSetting(mockAlertSetting);
		expect(mockSupabase.from).toHaveBeenCalledWith('weather_readings');
		expect(mockSupabase.from).toHaveBeenCalledWith('delivery_alert_logs');
		expect(isAlreadyAlertedSpy).toHaveBeenCalledWith('setting-123', 'high_temperature');
		expect(sendAlertSpy).toHaveBeenCalledWith(mockAlertSetting);
		expect(markAlertAsSentSpy).toHaveBeenCalledWith('setting-123', 'high_temperature');
	});
	it('does not send alert when already alerted', async () => {
		const mockWeatherSelectChain = {
			select: jest.fn().mockReturnThis(),
			order: jest.fn().mockReturnThis(),
			limit: jest.fn().mockResolvedValue({
				data: [{ temperature_c: 35 }],
				error: null,
			}),
		};

		const mockAlertLogUpsertChain = {
			upsert: jest.fn().mockReturnThis(),
			select: jest.fn().mockResolvedValue({
				data: [
					{
						delivery_alert_log_id: 'log-123',
						metric_value: 35,
						alert_type: 'high_temperature',
					},
				],
				error: null,
			}),
		};

		mockSupabase.from = jest.fn((table) => {
			if (table === 'weather_readings') {
				return mockWeatherSelectChain as any;
			}
			if (table === 'delivery_alert_logs') {
				return mockAlertLogUpsertChain as any;
			}
			return mockWeatherSelectChain as any;
		});

		isAlreadyAlertedSpy.mockResolvedValue(true);

		await manager.handleAlertSetting(mockAlertSetting);

		expect(isAlreadyAlertedSpy).toHaveBeenCalledWith('setting-123', 'high_temperature');
		expect(sendAlertSpy).not.toHaveBeenCalled();
		expect(markAlertAsSentSpy).not.toHaveBeenCalled();
	});
	it('sends alert when temperature below min and not already alerted', async () => {
		const mockWeatherSelectChain = {
			select: jest.fn().mockReturnThis(),
			order: jest.fn().mockReturnThis(),
			limit: jest.fn().mockResolvedValue({
				data: [{ temperature_c: -5 }],
				error: null,
			}),
		};

		const mockAlertLogUpsertChain = {
			upsert: jest.fn().mockReturnThis(),
			select: jest.fn().mockResolvedValue({
				data: [
					{
						delivery_alert_log_id: 'log-456',
						metric_value: -5,
						alert_type: 'low_temperature',
					},
				],
				error: null,
			}),
		};

		mockSupabase.from = jest.fn((table) => {
			if (table === 'weather_readings') {
				return mockWeatherSelectChain as any;
			}
			if (table === 'delivery_alert_logs') {
				return mockAlertLogUpsertChain as any;
			}
			return mockWeatherSelectChain as any;
		});

		await manager.handleAlertSetting(mockAlertSetting);

		expect(isAlreadyAlertedSpy).toHaveBeenCalledWith('setting-123', 'low_temperature');
		expect(sendAlertSpy).toHaveBeenCalledWith(mockAlertSetting);
		expect(markAlertAsSentSpy).toHaveBeenCalledWith('setting-123', 'low_temperature');
	});
	it('does not trigger alert when temperature is within range', async () => {
		const mockWeatherSelectChain = {
			select: jest.fn().mockReturnThis(),
			order: jest.fn().mockReturnThis(),
			limit: jest.fn().mockResolvedValue({
				data: [{ temperature_c: 20 }],
				error: null,
			}),
		};

		mockSupabase.from = jest.fn().mockReturnValue(mockWeatherSelectChain as any);

		await manager.handleAlertSetting(mockAlertSetting);

		expect(mockSupabase.from).toHaveBeenCalledWith('weather_readings');
		expect(isAlreadyAlertedSpy).not.toHaveBeenCalled();
		expect(sendAlertSpy).not.toHaveBeenCalled();
		expect(markAlertAsSentSpy).not.toHaveBeenCalled();
	});
});
