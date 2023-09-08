import { Client as DiscordClient, Events, Guild, REST } from 'discord.js';
import { Player as DiscordPlayer, Queue } from 'discord-player';
import { Routes } from 'discord-api-types/v9';
import { logger, Logger } from './logger';
import {
  buildApplicationCommandsJsonBody,
  buildCommandsMap,
} from './loadCommands';

export { runBot };

type BotDeps = {
  logger: Logger;
  discord: DiscordClient;
  player: DiscordPlayer;
};

async function runBot({ discord, logger, player }: BotDeps) {
  const commands = buildCommandsMap();
  registerSlashCommands({ logger }, { commands });

  discord.on(Events.ClientReady, () => {
    logger.info('The bot is ready');
  });

  discord.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, user } = interaction;

    const commandLogger = logger.child({
      requestedBy: user.username,
      commandName,
    });

    const command = commands.get(commandName);
    if (!command) {
      commandLogger.warn('Command not found');
      await interaction.reply({
        content: 'Command not found',
        ephemeral: true,
      });
      return;
    }

    const queue = player.createQueue(interaction.guild as Guild, {
      leaveOnEmpty: true,
      leaveOnEnd: true,
    });

    try {
      if (!queue.connection) {
        // TODO: fix types
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await queue.connect(interaction.member.voice.channel);
        queue.clear();
      }
    } catch (err) {
      queue.destroy();
      await interaction.reply({
        content: 'Could not join a voice channel',
        ephemeral: true,
      });
      return;
    }

    try {
      commandLogger.info('Invoking a command');
      await command.execute({
        interaction,
        logger: commandLogger,
        queue,
      });
    } catch (err) {
      commandLogger.error({ err }, 'Command error');
      queue.destroy();
      await interaction.reply({
        content: `There was an error while executing the "${commandName}" command!`,
        ephemeral: true,
      });
    }
  });

  player.on('error', handlePlayerError);
  player.on('connectionError', handlePlayerError);
}

function validateDiscordEnvs() {
  const { DC_TOKEN, DC_CLIENT_ID, DC_GUILD_ID } = process.env;

  if (!DC_TOKEN || !DC_CLIENT_ID || !DC_GUILD_ID) {
    throw new Error(
      'The necessary env variables are not set (DC_TOKEN or DC_CLIENT_ID or DC_GUILD_ID)'
    );
  }

  return {
    DC_TOKEN,
    DC_CLIENT_ID,
    DC_GUILD_ID,
  };
}

async function registerSlashCommands(
  { logger }: { logger: Logger },
  { commands }: { commands: ReturnType<typeof buildCommandsMap> }
) {
  const { DC_CLIENT_ID, DC_GUILD_ID, DC_TOKEN } = validateDiscordEnvs();
  const rest = new REST({ version: '10' }).setToken(DC_TOKEN);

  const response = await rest.put(
    Routes.applicationGuildCommands(DC_CLIENT_ID, DC_GUILD_ID),
    {
      body: buildApplicationCommandsJsonBody(commands),
    }
  );
  logger.info(
    `Successfully registered ${
      (response as { length: number }).length
    } application commands.`
  );
}

function handlePlayerError(queue: Queue<unknown>, err: Error) {
  logger.error({ err }, 'Discord player error occurred');
  if (!queue.destroyed) {
    const disconnect = true;
    queue.destroy(disconnect);
  }
}
