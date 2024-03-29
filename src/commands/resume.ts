import { SlashCommandBuilder } from 'discord.js';
import { DiscordCommand } from '../command';

export { ResumeCommand };

const ResumeCommand: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resumes paused track'),

  execute: ({ interaction, queue }) => {
    if (queue.playing) {
      queue.setPaused(false);
      return interaction.reply({ content: 'Track has been resumed' });
    }
    return interaction.reply({
      content: 'Nothing is playing',
      ephemeral: true,
    });
  },
};
