import { Player as DiscordPlayer } from 'discord-player';
import { ChatInputCommandInteraction, Guild } from 'discord.js';

export { createPlayerQueue };
export type { ChatInputCommandWithGuild };

interface PlayerQueueDeps {
  player: DiscordPlayer;
}

type ChatInputCommandWithGuild = ChatInputCommandInteraction & { guild: Guild };

function createPlayerQueue(
  { player }: PlayerQueueDeps,
  { interaction }: { interaction: ChatInputCommandWithGuild }
) {
  return player.queues.create(interaction.guild, {
    leaveOnEmpty: true,
    leaveOnEnd: true,
  });
}
