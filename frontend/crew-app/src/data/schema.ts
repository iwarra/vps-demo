import { z } from 'zod';

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const deliveryAlertSettingSchema = z.object({
	delivery_alert_setting_id: z.string(),
	type: z.string(),
	status: z.string(),
	created_by: z.string(),
	vehicles: z.array(z.string()),
	active_hours: z.array(z.object({ to: z.string(), from: z.string() })),
	trigger_values: z.array(z.object({ min: z.string(), max: z.string() })),
	active_dates: z.array(z.object({ to: z.string(), from: z.string() })),
	description: z.string(),
});

export type DeliveryAlertSetting = z.infer<typeof deliveryAlertSettingSchema>;

const ActiveDateSchema = z.object({
	to: z.string(),
	from: z.string(),
});

const ActiveDatesSchema = z.array(ActiveDateSchema);
export type ActiveDates = z.infer<typeof ActiveDatesSchema>;

const ActiveHourSchema = z.object({
	to: z.string(),
	from: z.string(),
});
const ActiveHoursSchema = z.array(ActiveHourSchema);
export type ActiveHours = z.infer<typeof ActiveHoursSchema>;

const TriggerValueSchema = z.object({
	min: z
		.number()
		.optional()
		.transform((val) => val ?? null),
	max: z
		.number()
		.optional()
		.transform((val) => val ?? null),
});
const TriggerValuesSchema = z.array(TriggerValueSchema);
export type TriggerValues = z.infer<typeof TriggerValuesSchema>;

const ReceiverSchema = z.object({
	email: z
		.email()
		.optional()
		.transform((val) => val ?? null),
	origin: z.enum(['custom', 'customer', 'driver']),
	originId: z.uuid().nullable(),
	phoneNumber: z
		.string()
		.optional()
		.transform((val) => val ?? null),
	receiverName: z.string(),
});
const ReceiversSchema = z.array(ReceiverSchema);
export type Receivers = z.infer<typeof ReceiversSchema>;

export const DeliveryAlertSettingsFormSchema = z.object({
	description: z.string(),
	type: z.enum(['temperature', 'speed', 'delay', 'out_of_range']),
	trigger_values: TriggerValuesSchema,
	vehicles: z.array(z.string()),
	active_dates: ActiveDatesSchema,
	active_hours: ActiveHoursSchema,
	alert_interval_minutes: z.number().int().min(1),
	receivers: ReceiversSchema,
});
export type DeliveryAlertSettingsForm = z.infer<typeof DeliveryAlertSettingsFormSchema>;

export const taskSchema = z.object({
	id: z.string(),
	title: z.string(),
	status: z.string(),
	label: z.string(),
	priority: z.string(),
});

export type Task = z.infer<typeof taskSchema>;

export const deliveryAlertTypesSchema = z.enum(['temperature', 'speed', 'delay', 'out_of_range']);

export type DeliveryAlertTypes = z.infer<typeof deliveryAlertTypesSchema>;

export const customerSchema = z.object({
	customer_id: z.string(),
	name: z.string().nullable(),
	address: z.string().nullable(),
	org_number: z.string().nullable(),
	user_id: z.string().nullable(),
});

export type Customer = z.infer<typeof customerSchema>;
