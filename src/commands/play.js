const { QueryType } = require('discord-player');

module.exports = {
  data: {
		name: 'play',
		description: 'plays a song',
		options: [
			{
				name: 'url',
				type: 3,
				description: 'The song you want to play',
				required: true
			}
		]
	},
  
  async execute({ interaction, player, logger, url }) {
    if (!interaction.member.voice.channelId) {
      return await interaction.reply({
        content: "You are not in a voice channel!",
        ephemeral: true
      });
    }

    const query = url || interaction.options.get('url').value;
    const searchResult = await player
      .search(query, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO
      })
    if (!searchResult || !searchResult.tracks.length) {
      logger.warn({ query }, 'track not found')
      return await interaction.channel.send(
        `No results found for ${interaction.user.username}`
      )
    }
    const { tracks: [track] } = searchResult


    const queue = player.createQueue(interaction.guild, {
      metadata: {
        channel: interaction.channel
      }
    });

    try {
      if (!queue.connection) {
        await queue.connect(interaction.member.voice.channel);
      }
      await interaction.channel.send(`Playing`)
      logger.info(`playing ${track.title}`)
      await queue.play(track);
    } catch (err) {
      queue.destroy();
      logger.error(
        {
          username: interaction.user.username,
          channelId: interaction.member.voice.channelId,
          error: err,
        },
        'something went wrong when queue tried to connect'
      )
      return await interaction.reply({
        content: "Could not join your voice channel!",
        ephemeral: true
      });
    }
    // await interaction.deferReply({  });
    
  }
}