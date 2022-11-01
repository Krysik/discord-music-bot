import {
  Client as DcClient,
  Events,
  GatewayIntentBits,
  Guild,
  REST,
} from 'discord.js';
import { Player, Queue } from 'discord-player';
import { Routes } from 'discord-api-types/v9';
import { logger, Logger } from './logger';
import {
  buildApplicationCommandsJsonBody,
  buildCommandsMap,
} from './loadCommands';

export { setupBot };

async function setupBot({ logger }: { logger: Logger }) {
  const { DC_TOKEN } = validateDiscordEnvs();
  const client = new DcClient({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildVoiceStates,
    ],
  });
  const commands = buildCommandsMap();
  registerSlashCommands({ logger });

  client.on(Events.ClientReady, () => {
    logger.info('The bot is ready');
  });

  const player = new Player(client, {
    ytdlOptions: { filter: 'audioonly' },
  });

  client.on(Events.InteractionCreate, async (interaction) => {
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
      await command.execute(
        {
          interaction,
          logger: commandLogger,
          queue,
        },
        {}
      );
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

  await client.login(DC_TOKEN);
  process.on('SIGINT', () => {
    client.destroy();
  });
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

async function registerSlashCommands({ logger }: { logger: Logger }) {
  const commands = buildCommandsMap();
  const { DC_CLIENT_ID, DC_GUILD_ID, DC_TOKEN } = validateDiscordEnvs();
  const rest = new REST({ version: '10' }).setToken(DC_TOKEN);

  try {
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
  } catch (err) {
    console.log(err);

    logger.error({ error: err }, 'error when trying to register the commands');
  }
}

function handlePlayerError(queue: Queue<unknown>, err: Error) {
  if (!queue.destroyed) {
    const disconnect = true;
    queue.destroy(disconnect);
  }
  logger.error({ err }, 'Discord player error occurred');
}
