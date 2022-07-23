import pino from 'pino';

export { logger };
export type { Logger };

type Logger = typeof logger;

const logLevel = process.env.LOG_LEVEL || 'info';
const env = process.env.NODE_ENV || 'production';

const logger = pino({
  level: logLevel,
  prettyPrint:
    env === 'production'
      ? {
          colorize: false,
          levelFirst: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss',
        }
      : { colorize: true },
});
