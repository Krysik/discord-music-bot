module.exports = {
  data: {
    name: 'resume',
    description: 'resumes paused song',
  },
  async execute({ interaction, player }) {
    const queue = player.getQueue(interaction.guild.id);
    if (!queue) {
      return await interaction.channel.send('No music currently playing');
    }
    const isSuccess = queue.setPaused(false);
    const msg = isSuccess
      ? `${queue.current.title} has been resumed`
      : 'Something went wrong';

    return await interaction.channel.send(msg);
  }
}