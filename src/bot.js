const { DC_TOKEN, DC_CLIENT_ID, DC_GUILD_ID } = process.env;
const {
  Client: DcClient,
  Events,
  GatewayIntentBits,
  REST,
} = require('discord.js');
const { Player } = require('discord-player');
const { Routes } = require('discord-api-types/v9');
const { loadCommands, getCommandsData } = require('./loadCommands');
const logger = require('./logger');

const rest = new REST({ version: '10' }).setToken(DC_TOKEN);

async function setupBot() {
  const client = new DcClient({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildVoiceStates,
    ],
  });
  const commands = loadCommands();
  try {
    const commandsData = getCommandsData(commands);
    await rest.put(Routes.applicationGuildCommands(DC_CLIENT_ID, DC_GUILD_ID), {
      body: commandsData,
    });
    logger.info(
      `Successfully registered application ${commandsData.length} commands`
    );
  } catch (err) {
    logger.error({ error: err }, 'error when trying to register the commands');
  }

  const player = new Player(client);

  player.on('trackStart', (queue, { title, requestedBy: { username } }) => {
    const { url } = queue.current;
    return queue.metadata.channel.send(`
			🎶 | Now playing **${title}**!\n
			Requested by: ${username}\n
			URL: ${url}
		`);
  });

  client.once(Events.ClientReady, () => {
    logger.info('The bot is ready');
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, user } = interaction;
    const cmd = commands.get(commandName);
    if (!cmd) return;

    const commandLogger = logger.child({
      executor: user.username,
      commandName,
      channelId: interaction.channelId,
    });

    const queue = player.createQueue(interaction.guild, {
      metadata: {
        channel: interaction.channel,
      },
      leaveOnEnd: true,
      leaveOnEmpty: true,
      leaveOnStop: true,
    });
    queue.clear();

    try {
      if (!queue.connection) {
        await queue.connect(interaction.member.voice.channel);
      }
      await interaction.deferReply({ ephemeral: true });
      await cmd.execute({
        interaction,
        player,
        logger: commandLogger,
        queue,
      });
    } catch (err) {
      console.log(err);
      commandLogger.error(
        {
          error: err,
        },
        `error when trying to execute the command "${commandName}"`
      );
      const disconnect = true;
      queue.destroy(disconnect);
      await interaction.reply({
        content: `Error occured during calling ${commandName} command`,
        ephemeral: true,
      });
    }
  });
  await client.login(DC_TOKEN);
  process.on('SIGINT', () => {
    client.destroy();
  });
}

module.exports = { setupBot };
