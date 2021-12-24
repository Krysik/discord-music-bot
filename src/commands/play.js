module.exports = {
  data: {
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
  async execute(interaction) {
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
  }
}