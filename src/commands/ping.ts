import { SlashCommandBuilder } from 'discord.js';
import { DiscordCommand } from '../command';

export { PingCommand };

const PingCommand: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Pings the bot'),

  execute: ({ interaction }) => {
    return interaction.reply({
      content: 'Pong!',
    });
  },
};
