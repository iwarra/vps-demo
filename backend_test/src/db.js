export const settingLog = {
	delivery_alert_log_id: 'd750d746-8222-458f-923b-6fdd61397e18',
	vehicle_id: '41d7f51c-eef9-488b-a13a-60245c50fa47',
	created_at: '2025-10-09T08:45:50.314223',
	sent: null,
	receivers: [
		{
			email: 'ikaikaca22@gmail.com',
			origin: 'custom',
			phoneNumber: '',
			receiverName: 'Ika',
		},
	],
	sent_at: null,
	alert_type: 'high_temperature',
	delivery_alert_setting_id: '4f3e6bdb-34ad-46a5-922d-461edf42687a',
	metric_value: null,
};

export const fetchedDeliveryAlertSettings = [
	{
		delivery_alert_setting_id: 'a87746ec-5623-4304-80d0-0bc568e813b6',
		description: 'test 2',
		vehicles: ['9180b59b-7bc1-41b6-b6f5-bdee830c1ba2'],
		type: 'high_temperature',
		active_hours: [
			{
				to: '12:00',
				from: '11:00',
			},
			{
				to: '10:00',
				from: '08:00',
			},
			{
				to: '20:30',
				from: '12:30',
			},
			{
				to: '16:30',
				from: '15:00',
			},
		],
		receivers: [
			{
				email: 'ikaikaca22@gmail.com',
				origin: 'custom',
				originId: null,
				phoneNumber: '',
				receiverName: 'Ika',
			},
		],
		alert_interval_minutes: 3,
		active_dates: [
			{
				to: '2025-10-13',
				from: '2025-10-06',
			},
		],
		created_at: '2025-10-06T06:39:13.272226',
		status: 'active',
		trigger_values: {
			min: null,
			max: 10,
		},
	},
	{
		delivery_alert_setting_id: '4f3e6bdb-34ad-46a5-922d-461edf42687a',
		description: 'custom',
		vehicles: ['41d7f51c-eef9-488b-a13a-60245c50fa47', '9180b59b-7bc1-41b6-b6f5-bdee830c1ba2'],
		type: 'high_temperature',
		active_hours: [
			{
				to: '10:30',
				from: '09:00',
			},
			{
				to: '13:30',
				from: '12:00',
			},
			{
				to: '12:00',
				from: '11:00',
			},
			{
				to: '20:00',
				from: '14:00',
			},
		],
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
			{
				to: '2025-10-13',
				from: '2025-10-06',
			},
			{
				to: '2025-10-07',
				from: '2025-10-06',
			},
		],
		created_at: '2025-10-06T06:37:48.026713',
		status: 'active',
		trigger_values: {
			min: null,
			max: 10,
		},
	},
	{
		delivery_alert_setting_id: '23acb928-0fc3-41c4-9817-b794edbf6e4a',
		description: 'Fabrique delivery',
		vehicles: ['9180b59b-7bc1-41b6-b6f5-bdee830c1ba2'],
		type: 'high_temperature',
		active_hours: [
			{
				to: '11:00',
				from: '08:00',
			},
			{
				to: '07:00',
				from: '12:00',
			},
		],
		receivers: [
			{
				email: 'ikaikaca22@gmail.com',
				origin: 'customer',
				originId: null,
				phoneNumber: '0700066888',
				receiverName: 'hornstull (Camille)',
			},
		],
		alert_interval_minutes: 5,
		active_dates: [
			{
				to: '2025-10-09',
				from: '2025-10-06',
			},
		],
		created_at: '2025-10-06T06:35:16.735324',
		status: 'active',
		trigger_values: {
			min: null,
			max: 10,
		},
	},
	{
		delivery_alert_setting_id: 'fc9ff53b-69f1-45ca-87e0-32e4569b80a2',
		description: 'test',
		vehicles: ['9180b59b-7bc1-41b6-b6f5-bdee830c1ba2'],
		type: 'high_temperature',
		active_hours: [
			{
				to: '10:00',
				from: '09:00',
			},
		],
		receivers: [
			{
				email: 'lalala@email.com',
				origin: 'custom',
				originId: null,
				phoneNumber: null,
				receiverName: 'ja',
			},
		],
		alert_interval_minutes: 5,
		active_dates: [
			{
				to: '2025-10-05',
				from: '2025-10-04',
			},
		],
		created_at: '2025-10-06T14:09:22.606912',
		status: 'expired',
		trigger_values: {
			min: null,
			max: 10,
		},
	},
];

export const testAlertSettings = [
	{
		delivery_alert_setting_id: 'test-1',
		description: 'Expired Alert',
		vehicles: ['v1', 'v2'],
		type: 'high_temperature',
		active_hours: [{ to: '14:00', from: '09:00' }],
		receivers: [
			{
				email: 'receiver@mail.com',
				origin: 'custom',
				originId: null,
				phoneNumber: '',
				receiverName: 'Receiver One',
			},
		],
		alert_interval_minutes: 2,
		active_dates: [
			{ to: '2025-10-13', from: '2025-10-06' },
			{ to: '2025-10-07', from: '2025-10-06' },
		],
		created_at: '2025-10-13 12:19:41.957343',
		status: 'expired',
		trigger_values: { max: 10, min: null },
	},
	{
		delivery_alert_setting_id: 'test-2',
		description: 'Active Test Alert',
		vehicles: ['vehicle-123'],
		type: 'high_temperature',
		active_hours: [{ to: '21:00', from: '09:00' }],
		receivers: [
			{
				email: 'test@mail.com',
				origin: 'custom',
				originId: null,
				phoneNumber: '',
				receiverName: 'Receiver Test',
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
	},
	{
		delivery_alert_setting_id: 'test-3',
		description: 'Another Test Alert',
		vehicles: ['test-vehicle'],
		type: 'high_temperature',
		active_hours: [{ to: '22:00', from: '09:00' }],
		receivers: [
			{
				email: 'one@mail.com',
				origin: 'custom',
				originId: null,
				phoneNumber: null,
				receiverName: 'One',
			},
		],
		alert_interval_minutes: 1,
		active_dates: [{ to: '2025-10-30', from: '2025-10-13' }],
		created_at: '2025-10-13 14:06:50.283759',
		status: 'active',
		trigger_values: { max: 8 },
	},
];
