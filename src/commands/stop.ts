import { SlashCommandBuilder } from 'discord.js';
import { DiscordCommand } from '../command';

export { StopCommand };

const StopCommand: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('stops a track'),

  execute({ interaction, queue }) {
    queue.stop();
    return interaction.reply({
      content: 'The track has been stopped',
    });
  },
};
