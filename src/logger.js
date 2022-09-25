const pino = require('pino');

const env = process.env.NODE_ENV || 'production';

const logger = pino({
  level: env === 'development' ? 'debug' : 'warn',
  ...(env !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  }),
});

module.exports = logger;
