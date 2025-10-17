import { CreateDeliveryAlertSettings } from '../../src/alertSettingsLogic';
import { expect, jest, test, describe, beforeEach } from '@jest/globals';

describe('sendAlert()', () => {
	let manager: CreateDeliveryAlertSettings;

	beforeEach(() => {
		manager = new CreateDeliveryAlertSettings();
	});

	test('should send emails to all receivers', async () => {
		const deliveryAlertSetting = {
			delivery_alert_setting_id: 'a1',
			active_dates: [{ to: '2025-10-30', from: '2025-10-06' }],
			description: 'Test Alert 1',
			vehicles: ['41d7f51c-eef9-488b-a13a-60245c50fa47'],
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

		const mockSendEmail = jest
			.spyOn(manager, 'sendEmailAlert')
			.mockResolvedValue({ ok: true } as Response);

		await manager.sendAlert(deliveryAlertSetting);

		expect(mockSendEmail).toHaveBeenCalledTimes(2);
	});

	test('handles partial failures', async () => {
		const deliveryAlertSetting = {
			delivery_alert_setting_id: 'a1',
			active_dates: [{ to: '2025-10-30', from: '2025-10-06' }],
			description: 'Test Alert 1',
			vehicles: ['41d7f51c-eef9-488b-a13a-60245c50fa47'],
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

		jest
			.spyOn(manager, 'sendEmailAlert')
			.mockResolvedValueOnce({ ok: true } as Response)
			.mockResolvedValueOnce({ ok: false } as Response);

		const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

		await manager.sendAlert(deliveryAlertSetting);

		expect(consoleSpy).toHaveBeenCalledWith(
			'Some email alerts failed:',
			expect.arrayContaining([{ status: 'fulfilled', value: { ok: false } }]),
		);

		consoleSpy.mockRestore();
	});
});
