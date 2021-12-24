module.exports = {
  data: {
    name: 'pause',
    description: 'pauses the song'
  },
  async execute({ interaction, player }) {
    const queue = player.getQueue(interaction.guild.id);
    if (!queue) {
      return await interaction.channel.send('No music currently playing');
    }

    const isSuccess = queue.setPaused(true);
    const msg = isSuccess ? `${queue.current.title} has been paused` : 'Something went wrong';
    return await interaction.channel.send(msg);
  }
}