import { Player as DiscordPlayer } from 'discord-player';
import { Client as DiscordClient, GatewayIntentBits } from 'discord.js';
import { YoutubeiExtractor } from 'discord-player-youtubei';

import { runBot } from './bot';
import { logger } from './logger';

async function shutdown({
  discord,
  player,
  signal,
}: {
  discord: DiscordClient;
  player: DiscordPlayer;
  signal: NodeJS.Signals;
}) {
  logger.info({ signal }, 'Shutting down the bot');

  discord.destroy();
  await player
    .destroy()
    .catch((err) => logger.error({ err }, 'Failed to destroy player'));
}

async function main() {
  const discord = new DiscordClient({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildVoiceStates,
    ],
  });

  const player = new DiscordPlayer(discord);

  process.on('SIGINT', (s) => shutdown({ discord, player, signal: s }));
  process.on('SIGTERM', (s) => shutdown({ discord, player, signal: s }));

  const DC_TOKEN = process.env.DC_TOKEN;
  if (!DC_TOKEN) {
    throw new Error('The "DC_TOKEN" env is not present');
  }

  await discord.login(DC_TOKEN);
  await player.extractors.register(YoutubeiExtractor, {});

  try {
    await runBot({
      discord,
      logger,
      player,
    });
  } catch (err) {
    logger.fatal({ err }, 'fatal error, the app has been stopped');
  }
}

main();
