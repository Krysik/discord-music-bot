module.exports = {
  data: {
    name: 'stop',
    description: 'stops the song',
  },
  async execute({ interaction, player }) {
    const queue = player.getQueue(interaction.guild.id);
    if (!queue) {
      return await interaction.channel.send('No music currently playing');
    }
    queue.stop();
  },
};
