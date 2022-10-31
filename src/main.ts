import { setupBot } from './bot';
import { logger } from './logger';

async function main() {
  try {
    await setupBot({ logger });
  } catch (err) {
    console.log(err);
    logger.fatal({ error: err }, 'fatal error, the app has been stopped');
  }
}

main();
