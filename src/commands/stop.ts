import { BaseCommand } from '../BaseCommand';
import { Queue } from 'discord-player';
import { CommandDeps } from '../commands.register';
import { ValidDcInteraction } from '../bot';

export class StopCmd extends BaseCommand {
  constructor(deps: CommandDeps) {
    super(deps, {
      name: 'stop',
      description: 'stops the song',
    });
  }

  async execute({
    interaction,
  }: {
    interaction: ValidDcInteraction;
    queue: Queue<unknown>;
  }): Promise<void> {
    const queue = this.player.getQueue(interaction.guild.id);

    if (!queue) {
      await interaction.channel.send('No music currently playing');
      return;
    }

    queue.stop();
  }
}
