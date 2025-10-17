import net from 'net';

const HOST = '13.60.98.248';
const PORT = 4000;

const client = new net.Socket();

client.connect(PORT, HOST, () => {
	console.log('Connected to server, simulating GPS data transmission...');

	setInterval(() => {
		const fakePayload = {
			imei: '123456789012345',
			data: [
				{
					gps: {
						lat: 51.5074,
						lng: -0.1278,
						altitude: 15,
						angle: 90,
						speed: Math.floor(Math.random() * 100),
						satellites: 7,
					},
					event_id: 1,
					timestamp: Date.now(),
					io: { ignition: true },
				},
			],
		};
		client.write(JSON.stringify(fakePayload));
	}, 5000); // Send data every 5 seconds
});

// client.on('data', (data) => {
// 	console.log('Received from server:', data.toString());
// });

client.on('close', () => {
	console.log('Connection closed');
});
