import { Player as DiscordPlayer } from 'discord-player';
import { Client as DiscordClient, GatewayIntentBits } from 'discord.js';
import { runBot } from './bot';
import { logger } from './logger';

async function main() {
  const discord = new DiscordClient({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildVoiceStates,
    ],
  });

  const player = new DiscordPlayer(discord, {
    ytdlOptions: { filter: 'audioonly' },
  });

  const DC_TOKEN = process.env.DC_TOKEN;
  if (!DC_TOKEN) {
    throw new Error('The "DC_TOKEN" env is not present');
  }

  await discord.login(DC_TOKEN);
  try {
    await runBot({
      discord,
      logger,
      player,
    });
  } catch (err) {
    logger.fatal({ err }, 'fatal error, the app has been stopped');
    process.exit(1);
  }

  process.on('SIGINT', () => {
    discord.destroy();
  });
}

main();
