import { setupBot } from './bot';
import { logger } from './logger';

declare global {
  /*
    To avoid adding DOM to the tsconfig.json file
    without it I was facing ts compilation error
  */
  type RequestInit = unknown;
}

async function main() {
  try {
    await setupBot();
  } catch (err) {
    logger.fatal({ error: err }, 'fatal error, the app has been stopped');
  }
}

main();
