
const { DC_CLIENT_ID, DC_GUILD_ID, DC_TOKEN } = process.env;
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = [
	{
		name: 'play',
		description: 'plays a song',
		options: [
			{
				name: 'query',
				type: 3,
				description: 'The song you want to play',
				required: true
			}
		]
	},
]

async function setupCommands() {
	const rest = new REST({ version: '9' }).setToken(DC_TOKEN);

	try {
		await rest.put(Routes.applicationGuildCommands(DC_CLIENT_ID, DC_GUILD_ID), { body: commands })
		console.log('Successfully registered application commands.')
	} catch (err) {
		console.log('err', err);
	}
	
}

module.exports = { setupCommands }

