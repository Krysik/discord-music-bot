import { SlashCommandBuilder } from 'discord.js';
import { DiscordCommand } from '../command';
import { buildCommandsMap } from '../loadCommands';

export { HelpCommand };

const HelpCommand: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays available commands'),

  execute: ({ interaction }) => {
    const allCommands = buildCommandsMap();
    let message = 'Available commands\n';

    for (const { data } of allCommands.values()) {
      const { name, description, options } = data;
      message += `cmd: **${name}** - ${description}\n`;
      if (options.length > 0) {
        for (const option of options) {
          const {
            name: optionName,
            description: optionDescription,
            required,
          } = option.toJSON();
          message += `
            - **${optionName}** (required: ${
            required ? 'Yes' : 'No'
          }): ${optionDescription}
          `;
        }
      }
      message += '\n';
    }

    return interaction.reply({
      content: message,
      ephemeral: true,
    });
  },
};
