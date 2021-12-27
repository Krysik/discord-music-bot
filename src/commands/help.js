const { getCommandsData } = require('../loadCommands');

module.exports = {
  data: {
    name: 'help',
    description: 'displays available commands',
  },
  async execute({ interaction }) {
    const commandsInfo = getCommandsData();

    let message = 'Available commands\n';
    
    for (const { name, description, options } of commandsInfo) {
      message += `cmd: **${name}** - ${description}\n`
      if (options) {
        for (const option of options) {
          const {
            name: optionName,
            description:
            optionDescription,
            required
          } = option;
          message += `
            - **${optionName}** (required: ${required}): ${optionDescription}
          `;
        }
      }
      message += '\n';
    }

    return await interaction.reply({
      content: message,
      ephemeral: true
    });
  }
}