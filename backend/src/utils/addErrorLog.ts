import fs from 'node:fs';
import path from 'path';

export interface ErrorLog {
	destination?: string | undefined;
	description: string;
	error: unknown;
}

function stringifyError(err: unknown): string {
	if (err instanceof Error) return `${err.message}\n${err.stack ?? ''}`;
	try {
		return JSON.stringify(err);
	} catch {
		return String(err);
	}
}

export function addErrorLog({ destination, description, error }: ErrorLog) {
	const timestamp = new Intl.DateTimeFormat('sv-SE', {
		timeZone: 'Europe/Stockholm',
		dateStyle: 'short',
		timeStyle: 'medium',
	}).format(new Date());

	const content = `[${timestamp}] Error ${description}:${stringifyError(error)}\n`;
	const logsDir = path.resolve(process.cwd(), 'errorLogs');
	const generalLog = path.join(logsDir, 'all-errors.log');
	const specificLog = destination ? path.join(logsDir, destination) : null;

	try {
		if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
		fs.appendFileSync(generalLog, content);
		if (specificLog) fs.appendFileSync(specificLog, content);
	} catch (fsError) {
		console.error('Failed to write log file:', fsError, 'for the following error: ', error);
	}
}
