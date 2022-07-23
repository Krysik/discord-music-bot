import type { Player, Queue } from 'discord-player';
import { logger } from './logger';
import { ValidDcInteraction } from './bot';

export { BaseCommand, CommandDeps, CommandData };

type CommandData = {
  name: string;
  description: string;
  options?: Array<{
    name: string;
    description: string;
    type?: number;
    required?: boolean;
  }>;
};

interface Command {
  getCommandData: () => CommandData;
  execute: (
    event: {
      interaction: ValidDcInteraction;
      queue: Queue;
    },
    args?: { url: string }
  ) => Promise<void>;
}

type CommandDeps = {
  player: Player;
  logger: typeof logger;
};

abstract class BaseCommand implements Command {
  private data: CommandData;

  protected readonly player: CommandDeps['player'];
  protected readonly logger: CommandDeps['logger'];

  constructor({ logger, player }: CommandDeps, cmdData: CommandData) {
    this.logger = logger;
    this.player = player;
    this.data = cmdData;
  }

  abstract execute(
    event: { interaction: ValidDcInteraction; queue: Queue },
    args?: { url?: string }
  ): Promise<void>;

  public getCommandData() {
    return this.data;
  }
}
