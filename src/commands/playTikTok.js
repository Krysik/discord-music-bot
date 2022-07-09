const https = require('https');

function fetchTikTokVideo({ logger }) {
  return ({ videoUrl }) => {
    return new Promise((resolve, reject) => {
      https
        .get(videoUrl, (response) => {
          resolve(response);
        })
        .on('error', (err) => {
          logger.error(
            { err, videoUrl },
            'Error during fetching a video from tiktok'
          );
          reject(err);
        });
    });
  };
}

module.exports = {
  data: {
    name: 'tiktok',
    description: 'allows to stream audio from tiktok',
    options: [
      {
        name: 'url',
        type: 3,
        description: 'The url to tiktok video',
        required: true,
      },
    ],
  },
  async execute({ interaction, logger, url, queue }) {
    if (!interaction.member.voice.channelId) {
      return await interaction.reply({
        content: 'You are not in a voice channel!',
        ephemeral: true,
      });
    }

    const urlToPlay = url || interaction.options.get('url').value;
    const readStream = await fetchTikTokVideo({ logger })({
      videoUrl: urlToPlay,
    });
    await queue.connection.playStream(
      queue.connection.createStream(readStream)
    );
    const {
      user: { username },
    } = interaction;
    await interaction.channel.send(`Playing\nRequested by: ${username}`);
  },
};
