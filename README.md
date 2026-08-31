# Discord Music Bot

Prerequisites:

- set up bot application in the [discord console](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)
- add bot to your server [doc reference](https://discordjs.guide/preparations/adding-your-bot-to-servers.html)

Each command is kept in the `src/commands` directory.

# Run locally

1. Copy environment variables template using the `cp .env.template .env` command
2. Fill in missing variables
3. Install dependencies within docker container by running the `docker compose run --rm bot pnpm install`
4. Run bot with `docker compose up`
