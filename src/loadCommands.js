const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const commandDirPath = path.join(__dirname, 'commands');

function loadCommands() {
  const commandFiles = fs
    .readdirSync(commandDirPath)
    .filter((file) => file.endsWith('.js'));

  const map = new Map();
  logger.info('loading the commands');
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    map.set(command.data.name, command);
  }

  logger.info(`loaded ${map.size} commands`);
  return map;
}

/**
 *
 * @param {Map<string, {name: string; description: string}>} commandsMap
 * @returns {{name: string; description: string}[]}
 */
function getCommandsData(commandsMap) {
  const commandsData = [];
  for (const command of commandsMap.values()) {
    commandsData.push(command.data);
  }
  return commandsData;
}

module.exports = { loadCommands, getCommandsData };
