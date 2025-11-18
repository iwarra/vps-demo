import express from 'express';
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './supabase.ts';
import { createClient, type User } from '@supabase/supabase-js';
import { CreateDeliveryAlertSettings } from './alertSettingsLogic.ts';
import { AlertScheduler } from './scheduler.ts';
import { normalizeDeliveryAlertSetting } from './utils/deliveryAlertSetting.ts';
import { addErrorLog } from '../src/utils/addErrorLog.ts';
dotenv.config();

//TODO: Implement user checks in all requests (delete needs extra role logic)
//TODO: validateData(payload) - Zod ?

declare global {
	namespace Express {
		interface Request {
			user?: User;
		}
	}
}

export const delAlertSettingsHandler = new CreateDeliveryAlertSettings();
const cronAlertScheduler = new AlertScheduler();
//cronAlertScheduler.startTest(); //start all jobs when the app is started
//cronAlertScheduler.stopAll();
const app = express();
const PORT = process.env.PORT || 8080;

app.use(
	cors({
		origin: '*',
		methods: ['GET', 'POST', 'PATCH', 'DELETE'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	}),
);

app.use(express.json());
const supabaseAuth = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

async function verifyUser(req: Request, res: Response, next: NextFunction) {
	try {
		const token = req.headers.authorization?.replace('Bearer ', '');
		if (!token) throw new Error('Missing authorization token');

		const {
			data: { user },
			error,
		} = await supabaseAuth.auth.getUser(token);

		if (error || !user) throw new Error('Invalid or expired user token');
		req.user = user;
		next();
	} catch (error) {
		console.error(error);
		addErrorLog({
			destination: 'user-verification.log',
			description: 'verifying the user',
			error,
		});
		res.status(401).json({ error: 'Invalid or expired token' });
	}
}

app.post('/api/auth/test-login', async (req: Request, res: Response) => {
	try {
		const { data, error } = await supabaseAuth.auth.signInWithPassword({
			email: process.env.TEST_USER_EMAIL!,
			password: process.env.TEST_USER_PASSWORD!,
		});

		if (error) throw error;

		res.json({ access_token: data.session?.access_token });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to create test session' });
	}
});

app.post('/api/delivery-alert-setting/add', verifyUser, async (req: Request, res: Response) => {
	try {
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
				updated_at: alertSetting.updated_at,
				is_deleted: alertSetting.is_deleted,
				created_by: user?.id,
			})
			.select()
			.single();
		if (error) throw new Error('Error adding del. alert setting');
		const normalizedData = normalizeDeliveryAlertSetting(data);
		const isAdded = await delAlertSettingsHandler.sortBy(normalizedData, [
			'hasActiveDates',
			'isActiveToday',
			'isActiveThisHour',
		]);
		if (isAdded) {
			await delAlertSettingsHandler.addToSchedule(data.delivery_alert_setting_id);
		}
		res.status(201).json({ ok: true });
	} catch (error) {
		addErrorLog({
			destination: 'delivery-alert-settings.log',
			description: 'adding the del. alert setting',
			error,
		});
		console.error(error);
		res.status(500).json({ error: 'Server error' });
	}
});

app.patch('/api/delivery-alert-setting/:id', verifyUser, async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const payload = req.body;
		const { data, error } = await supabase
			.from('delivery_alert_settings')
			.update(payload)
			.eq('delivery_alert_setting_id', id)
			.select()
			.single();
		if (error) throw new Error(`Error updating del. alert setting: ${id}`);
		const delAlertSettingId = data.delivery_alert_setting_id;
		delAlertSettingsHandler.removeAlertFromSystem(delAlertSettingId);
		const normalizedData = normalizeDeliveryAlertSetting(data);
		const isActive = await delAlertSettingsHandler.sortBy(normalizedData, [
			'hasActiveDates',
			'isActiveToday',
			'isActiveThisHour',
		]);

		if (isActive) {
			await delAlertSettingsHandler.addToSchedule(delAlertSettingId);
		}
		res.json(data);
	} catch (error) {
		addErrorLog({
			destination: 'delivery-alert-settings.log',
			description: 'updating the del. alert setting',
			error,
		});
		console.error(error);
		res.status(500).json({ error: 'Server error' });
	}
});

app.delete('/api/delivery-alert-setting/:id', verifyUser, async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { data, error } = await supabase
			.from('delivery_alert_settings')
			.update({ status: 'expired', is_deleted: true, deleted_at: new Date().toISOString() })
			.eq('delivery_alert_setting_id', id)
			.select();
		if (error) throw new Error(`Error deleting del. alert setting: ${id}`);

		if (data.length) {
			const delAlertSettingId = data[0].delivery_alert_setting_id;
			delAlertSettingsHandler.removeAlertFromSystem(delAlertSettingId);
		}
		res.sendStatus(204);
	} catch (error) {
		addErrorLog({
			destination: 'delivery-alert-settings.log',
			description: 'deleting the del. alert setting',
			error,
		});
		console.error(error);
		res.status(500).json({ error: 'Server error' });
	}
});

app.get('/api/delivery-alert-setting/:id', verifyUser, async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { data, error } = await supabase
			.from('delivery_alert_settings')
			.select('*')
			.eq('delivery_alert_setting_id', id)
			.single();
		if (error) throw new Error(`Error getting del. alert setting: ${id}`);
		return res.status(200).json(data);
	} catch (error) {
		addErrorLog({
			destination: 'delivery-alert-settings.log',
			description: 'getting the del. alert setting',
			error,
		});
		console.error(error);
		res.status(500).json({ error: 'Server error' });
	}
});

app.get('/api/delivery-alert-settings', verifyUser, async (req: Request, res: Response) => {
	try {
		const { data, error } = await supabase
			.from('delivery_alert_settings')
			.select(
				'delivery_alert_setting_id, description, vehicles, type, status, trigger_values, active_hours, active_dates, created_by, delivery_alert_setting_id',
			)
			.filter('is_deleted', 'is', null);
		if (error) throw new Error(`Error getting del. alert settings`);

		return res.status(200).json(data);
	} catch (error) {
		addErrorLog({
			destination: 'delivery-alert-settings.log',
			description: 'getting del. alert settings',
			error,
		});
		console.error(error);
		res.status(500).json({ error: 'Server error' });
	}
});

app.listen(Number(PORT), '0.0.0.0', () => {
	console.log(`Server running on ${PORT}`);
});
