import { Queue } from 'discord-player';
import { ValidDcInteraction } from '../bot';
import { BaseCommand } from '../BaseCommand';
import { PlayCmd } from './play';
import { CommandDeps } from '../commands.register';

export class RulesCmd extends BaseCommand {
  constructor(deps: CommandDeps) {
    super(deps, {
      name: 'rules',
      description: 'there are only 2 rules',
    });
  }

  async execute(
    {
      interaction,
      queue,
    }: {
      interaction: ValidDcInteraction;
      queue: Queue<unknown>;
    },
    { url }: { url?: string }
  ) {
    const playCmd = new PlayCmd({
      logger: this.logger,
      player: this.player,
    });
    await playCmd.execute({ interaction, queue }, { url });
  }
}
