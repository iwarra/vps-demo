import { CreateDeliveryAlertSettings } from '../../src/alertSettingsLogic';
import { supabase } from '../../src/supabase';
import { jest, describe, test, beforeEach, afterEach, expect } from '@jest/globals';

jest.mock('../../src/supabase');

describe('DB-related helper methods', () => {
	let manager: CreateDeliveryAlertSettings;

	beforeEach(() => {
		manager = new CreateDeliveryAlertSettings();
		jest.restoreAllMocks();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('markAlertAsSent', () => {
		test('calls DB update with correct delivery_alert_setting_id', async () => {
			type dbResponse = { data: any[]; error: null };

			const mockEq = jest
				.fn<(col: string, val: string) => Promise<dbResponse>>()
				.mockResolvedValue({ data: [], error: null });

			const mockUpdate = jest
				.fn<(arg: { sent: boolean; sent_at: 'string' }) => { eq: typeof mockEq }>()
				.mockReturnValue({ eq: mockEq });

			(supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

			await manager.markAlertAsSent('test-id-123');

			expect(mockUpdate).toHaveBeenCalledWith({ sent: true, sent_at: expect.any(String) });
			expect(mockEq).toHaveBeenCalledWith('delivery_alert_setting_id', 'test-id-123');
		});
	});

	describe('isAlreadyAlerted', () => {
		test('returns true if alert was already sent', async () => {
			type dbResponse = { data: Array<{ sent: boolean; sent_at: string }>; error: null };

			const mockLimit = jest.fn<(n: number) => Promise<dbResponse>>().mockResolvedValue({
				data: [{ sent: true, sent_at: '2025-10-14T10:00:00Z' }],
				error: null,
			});

			const mockOrder = jest
				.fn<(col: string, opts: { ascending: boolean }) => { limit: typeof mockLimit }>()
				.mockReturnValue({ limit: mockLimit });

			const mockEq3 = jest
				.fn<(col: string, val: any) => { order: typeof mockOrder }>()
				.mockReturnValue({ order: mockOrder });

			const mockEq2 = jest
				.fn<(col: string, val: any) => { eq: typeof mockEq3 }>()
				.mockReturnValue({ eq: mockEq3 });

			const mockEq1 = jest
				.fn<(col: string, val: any) => { eq: typeof mockEq2 }>()
				.mockReturnValue({ eq: mockEq2 });

			const mockSelect = jest
				.fn<(cols: string) => { eq: typeof mockEq1 }>()
				.mockReturnValue({ eq: mockEq1 });

			(supabase.from as jest.Mock).mockReturnValue({
				select: mockSelect,
			});

			const result = await manager.isAlreadyAlerted({
				delivery_alert_setting_id: 'abc',
				type: 'high_temperature',
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
				trigger_values: { max: 10, min: null },
			} as any);

			expect(mockSelect).toHaveBeenCalledWith('delivery_alert_log_id, sent_at, sent');
			expect(mockEq1).toHaveBeenCalledWith('delivery_alert_setting_id', 'abc');
			expect(mockEq2).toHaveBeenCalledWith('alert_type', 'high_temperature');
			expect(mockEq3).toHaveBeenCalledWith('sent', true);
			expect(mockOrder).toHaveBeenCalledWith('sent_at', { ascending: false });
			expect(mockLimit).toHaveBeenCalledWith(1);
			expect(result).toBe(true);
		});

		test('returns false if there is no previous alert log', async () => {
			type dbResponse = { data: any[]; error: null };

			const mockLimit = jest
				.fn<(n: number) => Promise<dbResponse>>()
				.mockResolvedValue({ data: [], error: null });

			const mockOrder = jest
				.fn<(col: string, opts: { ascending: boolean }) => { limit: typeof mockLimit }>()
				.mockReturnValue({ limit: mockLimit });

			const mockEq3 = jest
				.fn<(col: string, val: any) => { order: typeof mockOrder }>()
				.mockReturnValue({ order: mockOrder });

			const mockEq2 = jest
				.fn<(col: string, val: any) => { eq: typeof mockEq3 }>()
				.mockReturnValue({ eq: mockEq3 });

			const mockEq1 = jest
				.fn<(col: string, val: any) => { eq: typeof mockEq2 }>()
				.mockReturnValue({ eq: mockEq2 });

			const mockSelect = jest
				.fn<(cols: string) => { eq: typeof mockEq1 }>()
				.mockReturnValue({ eq: mockEq1 });

			(supabase.from as jest.Mock).mockReturnValue({
				select: mockSelect,
			});

			const result = await manager.isAlreadyAlerted({
				delivery_alert_setting_id: 'abc',
				type: 'low_temperature',
				description: 'Test Alert 2',
				vehicles: ['v2'],
				active_hours: [{ to: '18:00', from: '09:00' }],
				receivers: [
					{
						email: 'one@mail.com',
						origin: 'custom',
						originId: null,
						phoneNumber: '',
						receiverName: 'R3',
					},
				],
				alert_interval_minutes: 2,
				active_dates: [{ to: '2025-10-30', from: '2025-10-06' }],
				created_at: '2025-10-13 12:19:41.957343',
				status: 'active',
				trigger_values: { max: 10, min: 2 },
			} as any);

			expect(result).toBe(false);
		});
	});
});
