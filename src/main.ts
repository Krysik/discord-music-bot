import { Player } from 'discord-player';
import { Client as DcClient, GatewayIntentBits } from 'discord.js';
import { runBot } from './bot';
import { logger } from './logger';

async function main() {
  const client = new DcClient({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildVoiceStates,
    ],
  });

  const player = new Player(client, {
    ytdlOptions: { filter: 'audioonly' },
  });

  const DC_TOKEN = process.env.DC_TOKEN;
  if (!DC_TOKEN) {
    throw new Error('The "DC_TOKEN" env is not present');
  }

  await client.login(DC_TOKEN);
  try {
    await runBot({
      dcClient: client,
      logger,
      player,
    });
  } catch (err) {
    logger.fatal({ err }, 'fatal error, the app has been stopped');
    process.exit(1);
  }

  process.on('SIGINT', () => {
    client.destroy();
  });
}

main();
