import { Collection, RESTPostAPIApplicationCommandsJSONBody } from 'discord.js';

import { DiscordCommand } from './command';
import { HelpCommand } from './commands/help';
import { PingCommand } from './commands/ping';
import { PlayCommand } from './commands/play';
import { StopCommand } from './commands/stop';

type CommandName = DiscordCommand['data']['name'];

export { buildApplicationCommandsJsonBody, buildCommandsMap };

function buildCommandsMap() {
  const commandsMap = new Collection<CommandName, DiscordCommand>();

  commandsMap.set(HelpCommand.data.name, HelpCommand);
  commandsMap.set(PingCommand.data.name, PingCommand);
  commandsMap.set(PlayCommand.data.name, PlayCommand);
  commandsMap.set(StopCommand.data.name, StopCommand);

  return commandsMap;
}

function buildApplicationCommandsJsonBody(
  commandsMap: Collection<CommandName, DiscordCommand>
) {
  const commandsData: RESTPostAPIApplicationCommandsJSONBody[] = [];

  for (const command of commandsMap.values()) {
    commandsData.push(command.data.toJSON());
  }

  return commandsData;
}
