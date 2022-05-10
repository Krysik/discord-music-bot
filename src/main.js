const { setupBot } = require('./bot');
const logger = require('./logger');

async function main() {
  try {
    await setupBot();
  } catch (err) {
    logger.fatal({ error: err }, 'fatal error, the app has been stopped');
  }
}

main();
