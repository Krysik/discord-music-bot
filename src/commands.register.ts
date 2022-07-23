import { BaseCommand, CommandData, CommandDeps } from './BaseCommand';

import { HelpCmd } from './commands/help';
import { PingCmd } from './commands/ping';
import { PlayTikTok } from './commands/playTikTok';
import { PlayCmd } from './commands/play';
import { StopCmd } from './commands/stop';
import { RulesCmd } from './commands/rules';

export { buildCommandsMap, getCommandsData, CommandDeps, COMMANDS };

enum COMMANDS {
  STOP = 'stop',
  PING = 'ping',
  PLAY = 'play',
  TIK_TOK = 'tiktok',
  HELP = 'help',
  RULES = 'rules',
}

function buildCommandsMap(cmdDeps: CommandDeps): Record<COMMANDS, BaseCommand> {
  return {
    [COMMANDS.STOP]: new StopCmd(cmdDeps),
    [COMMANDS.PING]: new PingCmd(cmdDeps),
    [COMMANDS.PLAY]: new PlayCmd(cmdDeps),
    [COMMANDS.TIK_TOK]: new PlayTikTok(cmdDeps),
    [COMMANDS.RULES]: new RulesCmd(cmdDeps),
    [COMMANDS.HELP]: new HelpCmd(cmdDeps),
  };
}

function getCommandsData(cmdDeps: CommandDeps) {
  const commands = buildCommandsMap(cmdDeps);
  const commandsData: CommandData[] = [];

  for (const command of Object.values(commands)) {
    commandsData.push(command.getCommandData());
  }

  return commandsData;
}
