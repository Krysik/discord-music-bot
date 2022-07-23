import type { Queue } from 'discord-player';
import { ValidDcInteraction } from '../bot';
import { BaseCommand, CommandDeps } from '../BaseCommand';

export class PingCmd extends BaseCommand {
  constructor(deps: CommandDeps) {
    super(deps, {
      name: 'ping',
      description: 'pings the bot',
    });
  }

  async execute({
    interaction,
    queue,
  }: {
    interaction: ValidDcInteraction;
    queue: Queue<unknown>;
  }): Promise<void> {
    await interaction.reply({
      content: 'Pong!',
      ephemeral: true,
    });
    queue.destroy();
  }
}
