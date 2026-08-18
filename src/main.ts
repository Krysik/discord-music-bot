import { Player as DiscordPlayer } from 'discord-player';
import { Client as DiscordClient, GatewayIntentBits } from 'discord.js';
import { YoutubeiExtractor } from 'discord-player-youtubei';

import { runBot } from './bot';
import { logger } from './logger';
import { registerPlayerEvents } from './playerEvents';

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

  await discord
    .destroy()
    .catch((err) => logger.error({ err }, 'Failed to destroy discord client'));
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
  registerPlayerEvents({ player, logger });

  process.on('SIGINT', (s) => shutdown({ discord, player, signal: s }));
  process.on('SIGTERM', (s) => shutdown({ discord, player, signal: s }));

  const DC_TOKEN = process.env.DC_TOKEN;
  if (!DC_TOKEN) {
    throw new Error('The "DC_TOKEN" env is not present');
  }

  await discord.login(DC_TOKEN);
  await player.extractors.register(YoutubeiExtractor, {
    logLevel: process.env.LOG_LEVEL === 'debug' ? 'ALL' : 'NONE',
    // YouTube now answers with SABR-only responses for most videos: the audio
    // formats carry neither a direct url nor a signature cipher, and the
    // extractor's own downloader yields an empty stream - silently, so the
    // audio player just hangs in "buffering" forever. yt-dlp still resolves
    // those, so route stream extraction through it.
    useYoutubeDL: true,
  });

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
