require('dotenv').config();

const { setupBot } = require('./bot');

async function main() {
  try {
    await setupBot();
  } catch (err) {
    console.error(err);
  }
}

main();
