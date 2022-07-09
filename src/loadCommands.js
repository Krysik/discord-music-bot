const fs = require('fs');
const { Collection } = require('discord.js');
const path = require('path');
const logger = require('./logger');

const commandDirPath = path.join(__dirname, 'commands');

function loadCommands() {
  const commandFiles = fs
    .readdirSync(commandDirPath)
    .filter((file) => file.endsWith('.js'));

  const map = new Collection();
  logger.info('loading the commands');
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    map.set(command.data.name, command);
  }

  logger.info(`loaded ${map.size} commands`);
  return map;
}

function getCommandsData() {
  const commandFiles = fs
    .readdirSync(commandDirPath)
    .filter((file) => file.endsWith('.js'));

  const commandsData = [];
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    commandsData.push(command.data);
  }
  return commandsData;
}

module.exports = { loadCommands, getCommandsData };
