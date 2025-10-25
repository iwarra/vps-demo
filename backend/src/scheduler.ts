import { CronJob } from 'cron';
import { CreateDeliveryAlertSettings } from './alertSettingsLogic.ts';

export class AlertScheduler {
	private dailyJob: CronJob;
	private hourlyJob: CronJob;
	private testJob: CronJob;
	private delAlertSettingService: CreateDeliveryAlertSettings;

	constructor() {
		this.delAlertSettingService = new CreateDeliveryAlertSettings();

		// 1) triggers daily at 03:00 and rebuilds
		this.dailyJob = new CronJob(
			'0 0 3 * * *',
			async () => {
				console.log('[cron] Running daily alert fetch at 03:00');
				await this.delAlertSettingService.rebuild();
			},
			null,
			false,
			'Europe/Stockholm',
		);

		// 2) triggers every hour
		this.hourlyJob = new CronJob(
			'0 0 * * * *',
			async () => {
				console.log('[cron] Running hourly validators');
				await this.delAlertSettingService.rebuildForThisHour();
			},
			null,
			false,
			'Europe/Stockholm',
		);

		//test job - edit time to trigger when needed
		this.testJob = new CronJob(
			'0 00 14 * * *', // every 30 seconds -/30
			async () => {
				console.log('[TEST] Running daily alert fetch (every 30s)');
				await this.delAlertSettingService.rebuild();
			},
			null,
			false,
			'Europe/Stockholm',
		);
	}

	startTest() {
		this.testJob.start();
	}

	startAll() {
		this.dailyJob.start();
		this.hourlyJob.start();
	}

	startDailyRebuild() {
		this.dailyJob.start();
	}

	startHourlyRebuild() {
		this.hourlyJob.start();
	}

	stopDailyRebuild() {
		this.dailyJob.stop();
	}

	stopHourlyRebuild() {
		this.hourlyJob.stop();
	}

	stopAll() {
		this.dailyJob.stop();
		this.hourlyJob.stop();
	}
}
