const pino = require('pino');

const env = process.env.NODE_ENV || 'production';

const logger = pino({
  level: env === 'development' ? 'debug' : 'warn',
  prettyPrint:
    env === 'production'
      ? {
          colorize: true,
          levelFirst: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss',
        }
      : { colorize: true },
});

module.exports = logger;
