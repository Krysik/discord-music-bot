import { SlashCommandBuilder } from 'discord.js';
import { DiscordCommand } from '../command';

export { PauseCommand };

const PauseCommand: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pauses the current track'),

  execute: ({ interaction, queue }) => {
    if (queue.playing) {
      queue.setPaused(true);
      return interaction.reply({ content: 'Track has been paused' });
    }
    return interaction.reply({
      content: 'Nothing is playing',
      ephemeral: true,
    });
  },
};
