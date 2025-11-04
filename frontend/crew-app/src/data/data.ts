import { h } from 'vue';
import {
	ArrowDownIcon,
	ArrowRightIcon,
	ArrowUpIcon,
	CheckCircledIcon,
	CircleIcon,
	CrossCircledIcon,
	QuestionMarkCircledIcon,
	StopwatchIcon,
} from '@radix-icons/vue';

export const labels = [
	{
		value: 'bug',
		label: 'Bug',
	},
	{
		value: 'feature',
		label: 'Feature',
	},
	{
		value: 'documentation',
		label: 'Documentation',
	},
];

export const myStatuses = [
	{
		value: 'active',
		label: 'Active',
		icon: h(CheckCircledIcon),
	},
	{
		value: 'expired',
		label: 'Expired',
		icon: h(CrossCircledIcon),
	},
	{
		value: 'paused',
		label: 'Paused',
		icon: h(StopwatchIcon),
	},
	// {
	// 	value: 'done',
	// 	label: 'Done',
	// 	icon: h(CheckCircledIcon),
	// },
	// {
	// 	value: 'canceled',
	// 	label: 'Canceled',
	// 	icon: h(CrossCircledIcon),
	// },
];

export const statuses = [
	{
		value: 'backlog',
		label: 'Backlog',
		icon: h(QuestionMarkCircledIcon),
	},
	{
		value: 'todo',
		label: 'Todo',
		icon: h(CircleIcon),
	},
	{
		value: 'in progress',
		label: 'In Progress',
		icon: h(StopwatchIcon),
	},
	{
		value: 'done',
		label: 'Done',
		icon: h(CheckCircledIcon),
	},
	{
		value: 'canceled',
		label: 'Canceled',
		icon: h(CrossCircledIcon),
	},
];

export const priorities = [
	{
		value: 'low',
		label: 'Low',
		icon: h(ArrowDownIcon),
	},
	{
		value: 'medium',
		label: 'Medium',
		icon: h(ArrowRightIcon),
	},
	{
		value: 'high',
		label: 'High',
		icon: h(ArrowUpIcon),
	},
];

export const deliveryAlertTypes = [
	{
		value: 'temperature',
		label: 'Temperature',
	},
	{ value: 'speed', label: 'Speed' },
	{
		value: 'delay',
		label: 'Delay',
	},
	{
		value: 'out_of_range',
		label: 'Out of Range',
	},
];
