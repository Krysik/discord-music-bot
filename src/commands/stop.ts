import { SlashCommandBuilder } from 'discord.js';
import { DiscordCommand } from '../command';

export { StopCommand };

const StopCommand: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('stops a track'),

  execute({ interaction, queue }) {
    if (queue.playing) {
      queue.stop();
      return interaction.reply({
        content: 'The track has been stopped',
      });
    }
    return interaction.reply({
      content: 'Nothing is playing',
      ephemeral: true,
    });
  },
};
