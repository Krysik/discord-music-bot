import { Queue } from 'discord-player';
import { BaseCommand, CommandDeps } from '../BaseCommand';
import { ValidDcInteraction } from '../bot';

export class ResumeCmd extends BaseCommand {
  constructor(deps: CommandDeps) {
    super(deps, {
      name: 'resume',
      description: 'resumes paused song',
    });
  }

  async execute({
    interaction,
    queue,
  }: {
    interaction: ValidDcInteraction;
    queue: Queue<unknown>;
  }): Promise<void> {
    const isSuccess = queue.setPaused(false);
    const msg = isSuccess
      ? `${queue.current.title} has been resumed`
      : 'Something went wrong';

    await interaction.channel.send(msg);
  }
}
