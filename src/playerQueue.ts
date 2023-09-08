import { Player as DiscordPlayer } from 'discord-player';
import { ChatInputCommandInteraction, Guild } from 'discord.js';

export { createPlayerQueue };
export type { ChatInputCommandWithGuild };

interface PlayerQueueDeps {
  player: DiscordPlayer;
}

type ChatInputCommandWithGuild = ChatInputCommandInteraction & { guild: Guild };

async function createPlayerQueue(
  { player }: PlayerQueueDeps,
  { interaction }: { interaction: ChatInputCommandWithGuild }
) {
  const queue = player.createQueue(interaction.guild, {
    leaveOnEmpty: true,
    leaveOnEnd: true,
  });

  try {
    if (!queue.connection) {
      // TODO: fix types
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await queue.connect(interaction.member.voice.channel);
      queue.clear();
    }
    return queue;
  } catch (err) {
    queue.destroy();
    await interaction.reply({
      content: 'Could not join a voice channel',
      ephemeral: true,
    });
    return;
  }
}
