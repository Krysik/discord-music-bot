require('dotenv').config();

const { setupBot } = require('./bot');
const { setupCommands } = require('./commands/commands');


async function main() {
  try {
    await setupBot();
    await setupCommands();

  } catch (err) {
    console.log(err);
  }
}

main();
