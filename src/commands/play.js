const { Track } = require('discord-player');
const { YouTube } = require('youtube-sr')

function getTrack(player) {
  return async ({ url, requestedBy }) => {
    const video = await YouTube.getVideo(url);

    return new Track(player, {
      title: video.title,
      description: video.description,
      author: video.author?.name,
      requestedBy,
      source: 'youtube',
      url: video.url,
      raw: video
    })
  }
}

module.exports = {
  data: {
		name: 'play',
		description: 'plays a song',
		options: [
			{
				name: 'url',
				type: 3,
				description: 'The url to song you want to play',
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

    const passedUrl = url || interaction.options.get('url').value;
    const track = await getTrack(player)({
      url: passedUrl,
      requestedBy: interaction.user
    });

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
  }
}