import { z } from 'zod';

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const deliveryAlertSettingSchema = z.object({
	id: z.string(),
	type: z.string(),
	status: z.string(),
	vehicles: z.array(z.string()),
	creator: z.string(),
	hours: z.array(z.object({ to: z.string(), from: z.string() })),
	triggers: z.array(z.object({ min: z.string(), max: z.string() })),
	dates: z.array(z.object({ to: z.string(), from: z.string() })),
	label: z.string(),
});

export type DeliveryAlertSetting = z.infer<typeof deliveryAlertSettingSchema>;

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
