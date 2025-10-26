import { CreateDeliveryAlertSettings } from '../../src/alertSettingsLogic';
import { jest, describe, test, beforeEach, afterEach, expect } from '@jest/globals';
import { supabase } from '../../src/supabase';

jest.mock('../../src/supabase');
const mockSupabase = jest.mocked(supabase);
describe('markAlertAsSent', () => {
	let mockSelectChain: any;
	let mockUpdateChain: any;
	let manager: CreateDeliveryAlertSettings;

	beforeEach(() => {
		manager = new CreateDeliveryAlertSettings();
		jest.clearAllMocks();
		jest.useFakeTimers();
		jest.setSystemTime(new Date('2025-10-25T12:00:00Z'));

		// Setup select chain
		mockSelectChain = {
			select: jest.fn().mockReturnThis(),
			eq: jest.fn().mockReturnThis(),
			order: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			single: jest.fn(),
		};

		// Setup update chain
		mockUpdateChain = {
			update: jest.fn().mockReturnThis(),
			eq: jest.fn(),
		};
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('successfully marks alert as sent when log exists', async () => {
		const mockLog = { delivery_alert_log_id: 'log-123' };

		mockSupabase.from = jest.fn((table) => {
			if (table === 'delivery_alert_logs') {
				const callCount = (mockSupabase.from as jest.Mock).mock.calls.length;
				// First call: select query
				if (callCount === 1) {
					mockSelectChain.single.mockResolvedValue({
						data: mockLog,
						error: null,
					});
					return mockSelectChain;
				}
				// Second call: update query
				if (callCount === 2) {
					mockUpdateChain.eq.mockResolvedValue({
						data: null,
						error: null,
					});
					return mockUpdateChain;
				}
			}
			return mockSelectChain;
		});

		await manager.markAlertAsSent('setting-1', 'late_delivery');

		// Verify select query
		expect(mockSupabase.from).toHaveBeenCalledWith('delivery_alert_logs');
		expect(mockSelectChain.select).toHaveBeenCalledWith('delivery_alert_log_id');
		expect(mockSelectChain.eq).toHaveBeenCalledWith('delivery_alert_setting_id', 'setting-1');
		expect(mockSelectChain.eq).toHaveBeenCalledWith('alert_type', 'late_delivery');
		expect(mockSelectChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
		expect(mockSelectChain.limit).toHaveBeenCalledWith(1);
		expect(mockSelectChain.single).toHaveBeenCalled();

		// Verify update query
		expect(mockUpdateChain.update).toHaveBeenCalledWith({
			sent: true,
			sent_at: '2025-10-25T12:00:00.000Z',
		});
		expect(mockUpdateChain.eq).toHaveBeenCalledWith('delivery_alert_log_id', 'log-123');
	});

	it('logs error when fetching latest log fails', async () => {
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
		const testError = new Error('Database error');

		mockSupabase.from = jest.fn().mockReturnValue(mockSelectChain);
		mockSelectChain.single.mockResolvedValue({
			data: null,
			error: testError,
		});

		await manager.markAlertAsSent('setting-1', 'late_delivery');

		expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching latest log:', testError);
		expect(mockUpdateChain.update).not.toHaveBeenCalled();

		consoleErrorSpy.mockRestore();
	});

	it('does not update when no log is found', async () => {
		mockSupabase.from = jest.fn().mockReturnValue(mockSelectChain);
		mockSelectChain.single.mockResolvedValue({
			data: null,
			error: null,
		});

		await manager.markAlertAsSent('setting-1', 'late_delivery');

		expect(mockUpdateChain.update).not.toHaveBeenCalled();
	});

	it('logs error when update fails', async () => {
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
		const mockLog = { delivery_alert_log_id: 'log-123' };
		const updateError = new Error('Update failed');

		mockSupabase.from = jest.fn((table) => {
			const callCount = (mockSupabase.from as jest.Mock).mock.calls.length;
			if (callCount === 1) {
				mockSelectChain.single.mockResolvedValue({
					data: mockLog,
					error: null,
				});
				return mockSelectChain;
			}
			if (callCount === 2) {
				mockUpdateChain.eq.mockResolvedValue({
					data: null,
					error: updateError,
				});
				return mockUpdateChain;
			}
			return mockSelectChain;
		});

		await manager.markAlertAsSent('setting-1', 'late_delivery');

		expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating latest log:', updateError);

		consoleErrorSpy.mockRestore();
	});

	it('catches and logs unexpected exceptions', async () => {
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
		const unexpectedError = new Error('Unexpected error');

		mockSupabase.from = jest.fn().mockReturnValue(mockSelectChain);
		mockSelectChain.single.mockRejectedValue(unexpectedError);

		await manager.markAlertAsSent('setting-1', 'late_delivery');

		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'Failed updating alert log as sent:',
			unexpectedError,
		);

		consoleErrorSpy.mockRestore();
	});
});
