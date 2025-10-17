import express from 'express';
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './supabase.js';
import type { User } from '@supabase/supabase-js';
import { CreateDeliveryAlertSettings } from './alertSettingsLogic.js';
dotenv.config();

declare global {
	namespace Express {
		interface Request {
			user?: User;
		}
	}
}

const app = express();
const PORT = process.env.PORT || 8080;

app.use(
	cors({
		origin: 'http://localhost:5173', // frontend origin
		methods: ['GET', 'POST', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	}),
);

app.use(express.json());

async function verifyUser(req: Request, res: Response, next: NextFunction) {
	try {
		const token = req.headers.authorization?.replace('Bearer ', '');
		if (!token) return res.status(401).json({ error: 'Missing authorization token' });

		const {
			data: { user },
			error,
		} = await supabase.auth.getUser(token);

		if (error || !user) {
			return res.status(401).json({ error: 'Invalid or expired token' });
		}
		req.user = user; // attach user info to request
		next();
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal server error' });
	}
}

app.post('/api/delivery-alert-setting/add', verifyUser, async (req: Request, res: Response) => {
	const alertSetting = req.body;
	const user = req.user;
	//const isAdmin = user.app_metadata?.role === 'admin';
	const { data, error } = await supabase
		.from('delivery_alert_settings')
		.upsert({
			description: alertSetting.description,
			vehicles: alertSetting.vehicles,
			type: alertSetting.type,
			active_hours: alertSetting.active_hours,
			receivers: alertSetting.receivers,
			alert_interval_minutes: alertSetting.alert_interval_minutes,
			active_dates: alertSetting.active_dates,
			status: 'active',
			trigger_values: alertSetting.trigger_values,
		})
		.select()
		.single();
	if (!data) return;
	const delAlertSetting = new CreateDeliveryAlertSettings();
	delAlertSetting.sortBy(data, ['hasActiveDates', 'isActiveToday', 'isActiveThisHour']);
	delAlertSetting.forThisHour.forEach((alertId) => delAlertSetting.addToSchedule(alertId));
	res.status(200).json({ ok: true });
});

app.delete('/api/delivery-alert-setting/:id', async (req, res) => {
	const { id } = req.params;
	const { error } = await supabase
		.from('delivery_alert_settings')
		.delete()
		.eq('delivery_alert_setting_id', id);
	if (error) return res.status(400).json({ error: error.message });
	res.sendStatus(200);
});

app.patch('/api/delivery-alert-setting/:id', async (req, res) => {
	//TODO: User check
	const { id } = req.params;
	const payload = req.body;
	//TODO: validateData(payload)

	//Which fields are we allowed to edit?
	const { data, error } = await supabase
		.from('delivery_alert_settings')
		.update(payload)
		.eq('delivery_alert_setting_id', id)
		.select()
		.single();

	if (error) return res.status(400).json({ error: error.message });
	const delAlertSetting = new CreateDeliveryAlertSettings();
	delAlertSetting.sortBy(data, ['hasActiveDates', 'isActiveToday', 'isActiveThisHour']);
	delAlertSetting.forThisHour.forEach((alertId) => delAlertSetting.addToSchedule(alertId));

	//TODO: Call class logic here: If an alert setting is edited, remove it from all queues and revalidate
	res.json(data);
});

app.listen(Number(PORT), '0.0.0.0', () => {
	console.log(`Server running on ${PORT}`);
});
