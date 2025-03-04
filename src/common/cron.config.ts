// cron.config.ts
interface CronConfig {
  aggregatorUpdateInterval: string;
  dataRefreshInterval: string;
}

export default (): CronConfig => ({
  aggregatorUpdateInterval: process.env.AGG_UPDATE_CRON || '*/5 * * * *',
  dataRefreshInterval: process.env.DATA_REFRESH_CRON || '0 * * * *',
});
