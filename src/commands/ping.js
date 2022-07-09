module.exports = {
  data: {
    name: 'ping',
    description: 'pings the bot',
  },
  async execute({ interaction }) {
    return await interaction.reply('Pong!');
  },
};
