import { Queue } from 'discord-player';
import { BaseCommand, CommandDeps } from '../BaseCommand';
import { ValidDcInteraction } from '../bot';

export class PauseCmd extends BaseCommand {
  constructor(deps: CommandDeps) {
    super(deps, {
      name: 'pause',
      description: 'pauses the song',
    });
  }

  async execute({
    interaction,
    queue,
  }: {
    interaction: ValidDcInteraction;
    queue: Queue<unknown>;
  }): Promise<void> {
    const isSuccess = queue.setPaused(true);
    const msg = isSuccess
      ? `${queue.current.title} has been paused`
      : 'Something went wrong';
    await interaction.channel.send(msg);
  }
}
