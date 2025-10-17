import fetchMock from 'jest-fetch-mock';
import { CreateDeliveryAlertSettings } from '../../src/alertSettingsLogic';
import { describe, test, beforeEach, expect } from '@jest/globals';
fetchMock.enableMocks();

//Note: method is private, need to remove that for testing purposes

describe('sendEmailAlert()', () => {
	let manager: CreateDeliveryAlertSettings;
	beforeEach(() => {
		fetchMock.resetMocks();
		manager = new CreateDeliveryAlertSettings();
	});

	test('should send alert email successfully', async () => {
		fetchMock.mockResponseOnce(JSON.stringify({ ok: true }));
		const response = await manager.sendEmailAlert('test@example.com', 'subject', 'text');
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(response.ok).toBe(true);
	});

	test('handles failed response', async () => {
		fetchMock.mockResponseOnce('Bad Request', { status: 400 });
		const response = await manager.sendEmailAlert('test@example.com', 'subject', 'text');
		expect(response.status).toBe(400);
	});
});
