import { RESTPostAPIApplicationCommandsJSONBody } from 'discord.js';

import { DiscordCommand } from './command';
import { HelpCommand } from './commands/help';
import { PauseCommand } from './commands/pause';
import { PingCommand } from './commands/ping';
import { PlayCommand } from './commands/play';
import { ResumeCommand } from './commands/resume';
import { StopCommand } from './commands/stop';

type CommandName = DiscordCommand['data']['name'];

export { buildApplicationCommandsJsonBody, buildCommandsMap };

function buildCommandsMap() {
  const commandsMap = new Map<CommandName, DiscordCommand>([
    [PingCommand.data.name, PingCommand],
    [PlayCommand.data.name, PlayCommand],
    [StopCommand.data.name, StopCommand],
    [HelpCommand.data.name, HelpCommand],
    [PauseCommand.data.name, PauseCommand],
    [ResumeCommand.data.name, ResumeCommand],
  ]);

  return commandsMap;
}

function buildApplicationCommandsJsonBody(
  commandsMap: Map<CommandName, DiscordCommand>
) {
  const commandsData: RESTPostAPIApplicationCommandsJSONBody[] = [];

  for (const command of commandsMap.values()) {
    commandsData.push(command.data.toJSON());
  }

  return commandsData;
}
