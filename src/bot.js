const { DC_TOKEN } = process.env;
const { Client: DcClient, Intents } = require('discord.js');
const { Player, QueryType } = require('discord-player');

async function setupBot() {
	const client = new DcClient({
		intents: [
			Intents.FLAGS.GUILDS,
			Intents.FLAGS.GUILD_MEMBERS,
			Intents.FLAGS.GUILD_MESSAGES,
			Intents.FLAGS.GUILD_VOICE_STATES
		]
	});
	const player = playerFactory(client);

	client.once('ready', () => {
		console.log('The bot is ready');
	})

	player.on("trackStart", (queue, { title }) => {
		
		return queue.metadata.channel.send(`🎶 | Now playing **${title}**!`)
	})


	client.on('interactionCreate', async (interaction) => {
		if (!interaction.isCommand()) return;

		const { commandName } = interaction;

		if (commandName === 'ping') {
			return await interaction.reply('Pong!');
		}
		if (commandName === 'play') {
			if (!interaction.member.voice.channelId) {
				return await interaction.reply({
					content: "You are not in a voice channel!",
					ephemeral: true
				});
			}
			const query = interaction.options.get('query').value;
			const searchResult = await player
				.search(query, {
					requestedBy: interaction.user,
					searchEngine: QueryType.AUTO
				})
			if (!searchResult || !searchResult.tracks.length) {
				console.log('track not found');
				return await interaction.channel.send(
					`No results found for ${interaction.user.username}`
				)
			}
			const { tracks: [track]} = searchResult


			const queue = player.createQueue(interaction.guild, {
				metadata: {
					channel: interaction.channel
				}
			});

			try {
				if (!queue.connection) {
					await queue.connect(interaction.member.voice.channel);
				}
			} catch {
				queue.destroy();
				console.log('something went wrong');
				return await interaction.reply({
					content: "Could not join your voice channel!",
					ephemeral: true
				});
			}
			// await interaction.deferReply({  });
			

			await interaction.channel.send(`Playing`)
			if (!queue.playing) {
				await queue.play(track);
			}
			// return await interaction.followUp({
			// 	content: `⏱️ | Loading track **${track.title}**!`
			// });
		}

		

	})
	await client.login(DC_TOKEN);
}

function playerFactory(dcClient) {
	return new Player(dcClient)
}

module.exports = {
	setupBot
}
