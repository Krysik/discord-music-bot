const { DC_TOKEN, DC_CLIENT_ID, DC_GUILD_ID } = process.env;
const { Client: DcClient, GatewayIntentBits, REST } = require('discord.js');
const { Player } = require('discord-player');
const { Routes } = require('discord-api-types/v9');
const { loadCommands, getCommandsData } = require('./loadCommands');
const logger = require('./logger');

const rest = new REST({ version: '9' }).setToken(DC_TOKEN);

async function setupBot() {
  const client = new DcClient({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildVoiceStates,
    ],
  });

  try {
    await rest.put(Routes.applicationGuildCommands(DC_CLIENT_ID, DC_GUILD_ID), {
      body: getCommandsData(),
    });
    logger.info('Successfully registered application commands.');
  } catch (err) {
    logger.error({ error: err }, 'error when trying to register the commands');
  }

  const commands = loadCommands();

  const player = new Player(client);

  player.on('trackStart', (queue, { title, requestedBy: { username } }) => {
    const { url } = queue.current;
    return queue.metadata.channel.send(`
			🎶 | Now playing **${title}**!\n
			Requested by: ${username}\n
			URL: ${url}
		`);
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, user } = interaction;
    const cmd = commands.get(commandName);
    if (!cmd) return;

    const commandLogger = logger.child({
      executor: user.username,
      commandName,
    });

    const queue = player.createQueue(interaction.guild, {
      metadata: {
        channel: interaction.channel,
      },
    });

    try {
      if (!queue.connection) {
        await queue.connect(interaction.member.voice.channel);
      }
      commandLogger.info('invoking a command');
      await cmd.execute({
        interaction,
        player,
        logger: commandLogger,
        queue,
      });
    } catch (err) {
      logger.error(
        {
          error: err,
          commandName: commandName,
          username: interaction.user.username,
          channelId: interaction.member.voice.channelId,
        },
        `error when trying to execute the command ${commandName}`
      );
      queue.destroy();
      await interaction.reply({
        content: `Error occured during calling ${commandName} command`,
        ephemeral: true,
      });
    }
  });
  await client.login(DC_TOKEN);
}

module.exports = { setupBot };
