import { Player, Track } from 'discord-player';
import { SlashCommandBuilder, User } from 'discord.js';
import { DiscordCommand } from '../command';
import { YouTube } from 'youtube-sr';
import { Logger } from '../logger';

export { PlayCommand };

function getTrack({ player, logger }: { player: Player; logger: Logger }) {
  return async ({ url, requestedBy }: { url: string; requestedBy: User }) => {
    try {
      const video = await YouTube.getVideo(url);

      return new Track(player, {
        title: video.title ?? '',
        description: video.description ?? '',
        author: '',
        requestedBy,
        source: 'youtube',
        url: video.url,
        raw: video,
        thumbnail: '',
        duration: String(video.duration),
        views: video.views,
      });
    } catch (err) {
      logger.error({ err }, 'Error while getting track');
      return null;
    }
  };
}

const PlayCommand: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName('play')
    .addStringOption((option) =>
      option
        .setName('url')
        .setDescription('The url to song you want to play')
        .setRequired(true)
    )
    .setDescription('Plays a track'),

  async execute({ interaction, queue, logger }) {
    const isRequired = true;
    const url = interaction.options.getString('url', isRequired);
    await interaction.deferReply();

    const track = await getTrack({ player: queue.player, logger })({
      url,
      requestedBy: interaction.user,
    });

    if (track) {
      await queue.play(track);
      return interaction.editReply({
        content: `
          🎶 | Playing the **${track.title}**\n
          Requested by: ${interaction.user.username}\n
          URL: ${url}
        `,
      });
    }

    return interaction.editReply({
      content: `Track not found for a given URL\n${url}`,
    });
  },
};
