import { CreateDeliveryAlertSettings } from '../../src/alertSettingsLogic';
import { jest, describe, test, beforeEach, afterEach, expect } from '@jest/globals';
import { supabase } from '../../src/supabase';

jest.mock('../../src/supabase');
const mockSupabase = jest.mocked(supabase);

describe('isAlreadyAlerted', () => {
	let manager: CreateDeliveryAlertSettings;
	let mockSelect: jest.Mock;
	let mockEq: jest.Mock;
	let mockOrder: jest.Mock;
	let mockLimit: jest.Mock;

	beforeEach(() => {
		manager = new CreateDeliveryAlertSettings();
		jest.clearAllMocks();

		mockSelect = jest.fn().mockReturnThis();
		mockEq = jest.fn().mockReturnThis();
		mockOrder = jest.fn().mockReturnThis();
		mockLimit = jest.fn();

		mockSupabase.from = jest.fn().mockReturnValue({
			select: mockSelect,
			eq: mockEq,
			order: mockOrder,
			limit: mockLimit,
		});
	});

	test('returns true if alert was already sent', async () => {
		mockLimit.mockResolvedValue({
			data: [
				{
					delivery_alert_setting_id: 'abc',
					type: 'temperature',
					description: 'Test Alert',
					vehicles: ['v2'],
					active_hours: [{ to: '18:00', from: '09:00' }],
					receivers: [
						{
							email: 'one@mail.com',
							origin: 'custom',
							originId: null,
							phoneNumber: '',
							receiverName: 'R2',
						},
					],
					alert_interval_minutes: 2,
					active_dates: [{ to: '2025-10-30', from: '2025-10-06' }],
					created_at: '2025-10-13 12:19:41.957343',
					status: 'active',
					trigger_values: { max: undefined, min: 5 },
				},
			],
			error: null,
		});

		const result = await manager.isAlreadyAlerted('abc', 'low_temperature');

		expect(result).toBe(true);
		expect(supabase.from).toHaveBeenCalledWith('delivery_alert_logs');
		expect(mockSelect).toHaveBeenCalledWith('delivery_alert_log_id, sent_at, sent, alert_type');
		expect(mockEq).toHaveBeenCalledWith('delivery_alert_setting_id', 'abc');
		expect(mockEq).toHaveBeenCalledWith('sent', true);
		expect(mockEq).toHaveBeenCalledWith('alert_type', 'low_temperature');
		expect(mockOrder).toHaveBeenCalledWith('sent_at', { ascending: false });
		expect(mockLimit).toHaveBeenCalledWith(1);
	});

	it('returns false when data is null', async () => {
		mockLimit.mockResolvedValue({
			data: null,
			error: null,
		});

		const result = await manager.isAlreadyAlerted('abc', 'low_temperature');
		expect(result).toBe(false);
	});

	it('returns false and logs error when query fails', async () => {
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
		const testError = new Error('Database connection failed');

		mockLimit.mockResolvedValue({
			data: null,
			error: testError,
		});

		const result = await manager.isAlreadyAlerted('abc', 'low_temperature');

		expect(result).toBe(false);
		expect(consoleErrorSpy).toHaveBeenCalledWith('Failed checking alert history:', testError);

		consoleErrorSpy.mockRestore();
	});
});
