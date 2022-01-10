const { execute: playSong } = require('./play');

module.exports = {
  data: {
    name: 'rules',
    description: 'there are only 2 rules',
  },
  async execute({ interaction, player, logger }) {
    const url = 'https://youtu.be/uPjoCh022BM'
    await playSong({ interaction, player, logger, url })
  }
}