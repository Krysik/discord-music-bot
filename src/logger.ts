import pino from 'pino';

type Logger = typeof logger;

export { logger };
export type { Logger };

const env = process.env.NODE_ENV || 'production';
const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  ...(env !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  }),
});
