const { DC_TOKEN, DC_CLIENT_ID, DC_GUILD_ID } = process.env;
const { Client: DcClient, Intents } = require('discord.js');
const { Player } = require('discord-player');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { loadCommands, getCommandsData } = require('./loadCommands');

const rest = new REST({ version: '9' }).setToken(DC_TOKEN);


async function setupBot() {
	const client = new DcClient({
		intents: [
			Intents.FLAGS.GUILDS,
			Intents.FLAGS.GUILD_MEMBERS,
			Intents.FLAGS.GUILD_MESSAGES,
			Intents.FLAGS.GUILD_VOICE_STATES
		]
	});

	try {
		await rest.put(
			Routes.applicationGuildCommands(DC_CLIENT_ID, DC_GUILD_ID),
			{ body: getCommandsData() }
		)
		console.log('Successfully registered application commands.')
	} catch (err) {
		console.log('err', err);
	}

	client.commands = loadCommands();

	const player = new Player(client);

	client.once('ready', () => {
		console.log('The bot is ready');
	})

	player.on("trackStart", (queue, { title }) => {
		return queue.metadata.channel.send(`🎶 | Now playing **${title}**!`)
	})


	client.on('interactionCreate', async (interaction) => {
		if (!interaction.isCommand()) return;
		
		const { commandName } = interaction;
		const cmd = client.commands.get(commandName)

		if (!cmd) return;
		
		try {
			await cmd.execute({ interaction, player })
		} catch (err) {
			console.error(err)
			await interaction.reply({ content: `Error occured during calling ${commandName} command`, ephemeral: true })
		}
	})
	await client.login(DC_TOKEN);
}

module.exports = {
	setupBot
}
