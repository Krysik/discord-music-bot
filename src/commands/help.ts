import { ValidDcInteraction } from '../bot';
import { buildCommandsMap, CommandDeps } from '../commands.register';
import { BaseCommand } from '../BaseCommand';

export class HelpCmd extends BaseCommand {
  constructor(deps: CommandDeps) {
    super(deps, {
      name: 'help',
      description: 'displays available commands',
    });
  }

  async execute(event: { interaction: ValidDcInteraction }): Promise<void> {
    const commandsMap = buildCommandsMap({
      logger: this.logger,
      player: this.player,
    });

    let message = 'Available commands\n';
    for (const command of Object.values(commandsMap)) {
      const { name, description, options } = command.getCommandData();
      message += `command: **${name}** - ${description}\n`;

      if (options) {
        for (const option of options) {
          const {
            name: optionName,
            description: optionDescription,
            required,
          } = option;
          message += `
            - **${optionName}** (required: ${required}): ${optionDescription}
          `;
        }
      }
      message += '\n';
    }

    await event.interaction.reply({
      content: message,
      ephemeral: true,
    });
  }
}
