import { Client as DiscordClient, Events, Interaction, REST } from 'discord.js';
import { Player as DiscordPlayer, Player, Queue } from 'discord-player';
import { Routes } from 'discord-api-types/v10';
import { logger, Logger } from './logger';
import {
  buildApplicationCommandsJsonBody,
  buildCommandsMap,
} from './loadCommands';
import { createPlayerQueue, ChatInputCommandWithGuild } from './playerQueue';
import { DiscordCommand } from './command';

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

  process.on('SIGINT', () => {
    discord.destroy();

    const disconnect = true;
    for (const queue of player.queues.values()) {
      queue.destroy(disconnect);
    }
  });

  discord.on(
    Events.InteractionCreate,
    createInteractionCreateEventHandler({
      commands,
      player,
    })
  );

  player.on('error', handlePlayerError);
  player.on('connectionError', handlePlayerError);
}

function createInteractionCreateEventHandler({
  player,
  commands,
}: {
  player: Player;
  commands: Map<string, DiscordCommand>;
}) {
  return async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, user } = interaction;

    const commandLogger = logger.child({
      requestedBy: user.username,
      commandName,
    });
    const command = commands.get(commandName);

    if (!command) {
      await interaction.reply({
        content: 'Command not found',
        ephemeral: true,
      });
      return;
    }

    if (!interaction.guild) return;

    const queue = await createPlayerQueue(
      { player },
      {
        interaction: interaction as ChatInputCommandWithGuild,
      }
    );
    if (!queue) return;

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
  };
}

function validateDiscordEnvs() {
  const { DC_TOKEN, DC_CLIENT_ID, DC_GUILD_ID } = process.env;

  if (!DC_TOKEN || !DC_CLIENT_ID || !DC_GUILD_ID) {
    throw new Error(
      'The necessary env variables are not set (DC_TOKEN or DC_CLIENT_ID or DC_GUILD_ID)'
    );
  }

  return { DC_TOKEN, DC_CLIENT_ID, DC_GUILD_ID };
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
