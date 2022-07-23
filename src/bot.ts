import {
  CacheType,
  Client as DcClient,
  CommandInteraction,
  Guild,
  GuildMember,
  Intents,
  Interaction,
  TextBasedChannels,
} from 'discord.js';
import { Player, Queue, Track } from 'discord-player';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { logger } from './logger';
import {
  buildCommandsMap,
  getCommandsData,
  COMMANDS,
} from './commands.register';

export { setupBot, ValidDcInteraction };

type ValidDcInteraction = CommandInteraction<CacheType> & {
  channel: TextBasedChannels;
  guild: Guild;
};

async function setupBot() {
  const client = new DcClient({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MEMBERS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_VOICE_STATES,
    ],
  });
  const player = new Player(client);
  const { DC_TOKEN, DC_CLIENT_ID, DC_GUILD_ID } = validateDiscordEnvs();
  await client.login(DC_TOKEN);

  await registerApplicationCommands({
    player,
    dcToken: DC_TOKEN,
    dcClientId: DC_CLIENT_ID,
    dcGuildId: DC_GUILD_ID,
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { user, commandName } = interaction;
    const commandLogger = logger.child({
      executor: user.username,
      commandName,
    });

    if (interaction.guild === null) {
      commandLogger.error('No guild to interact with');
      await interaction.reply({
        content: 'No guild to interact with',
        ephemeral: true,
      });
      return;
    }
    const caller = interaction.member as GuildMember;

    if (!caller.voice || !caller.voice.channel) {
      commandLogger.error('The user is not connected to a voice channel');
      await interaction.reply({
        content: 'You are not connected to the voice channel',
        ephemeral: true,
      });
      return;
    }

    const queue = player.createQueue(interaction.guild, {
      metadata: {
        channel: interaction.channel,
      },
    });
    const commands = buildCommandsMap({
      logger: commandLogger,
      player,
    });
    try {
      const commandToInvoke = commands[stringToCommandLiteral(commandName)];
      if (!queue.connection) {
        await queue.connect(caller.voice.channel);
      }
      await commandToInvoke.execute({
        interaction: interaction as ValidDcInteraction,
        queue,
      });
      queue.stop();
    } catch (err) {
      logger.error(
        {
          error: err,
          commandName: commandName,
          username: interaction.user.username,
          channelId: interaction.channelId,
        },
        `error when trying to execute the command ${commandName}`
      );

      if (err instanceof CommandNotFound) {
        return await interaction.reply({
          content: `Command ${commandName} was not found`,
          ephemeral: true,
        });
      }

      queue.destroy();
      return await interaction.reply({
        content: `An error occurred while executing the ${commandName} command`,
        ephemeral: true,
      });
    }

    const trackStartEventHandler = trackStartEventHandlerFactory({
      interaction,
    });
    player.on('trackStart', trackStartEventHandler);
  });
}

function trackStartEventHandlerFactory({
  interaction,
}: {
  interaction: Interaction<CacheType>;
}) {
  return async (
    queue: Queue<unknown>,
    { title, requestedBy: { username } }: Track
  ) => {
    const { url } = queue.current;
    if (interaction.channel) {
      await interaction.channel.send(`
      🎶 | Now playing **${title}**!\n
      Requested by: ${username}\n
      URL: ${url}
    `);
    }
  };
}

function stringToCommandLiteral(userInputCommand: string): COMMANDS {
  switch (userInputCommand) {
    case 'play':
      return COMMANDS.PLAY;
    case 'tiktok':
      return COMMANDS.TIK_TOK;
    case 'stop':
      return COMMANDS.STOP;
    case 'ping':
      return COMMANDS.PING;
    case 'rules':
      return COMMANDS.RULES;
    case 'help':
      return COMMANDS.HELP;
  }
  throw new CommandNotFound(`Unexpected command ${userInputCommand}`);
}

async function registerApplicationCommands({
  player,
  dcToken,
  dcClientId,
  dcGuildId,
}: {
  player: Player;
  dcToken: string;
  dcClientId: string;
  dcGuildId: string;
}) {
  try {
    const rest = new REST({ version: '9' }).setToken(dcToken);
    await rest.put(Routes.applicationGuildCommands(dcClientId, dcGuildId), {
      body: getCommandsData({ logger, player }),
    });
    logger.info('Successfully registered application commands.');
  } catch (err) {
    logger.error({ error: err }, 'error when trying to register the commands');
    throw err;
  }
}

class CommandNotFound extends Error {}

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
