import { Player, Track } from 'discord-player';
import { SlashCommandBuilder, User } from 'discord.js';
import { DiscordCommand } from '../command';
import { YouTube } from 'youtube-sr';

export { PlayCommand };

function getTrack(player: Player) {
  return async ({ url, requestedBy }: { url: string; requestedBy: User }) => {
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

  async execute({ interaction, queue }) {
    const isRequired = true;
    const url = interaction.options.getString('url', isRequired);
    await interaction.deferReply();

    const track = await getTrack(queue.player)({
      url,
      requestedBy: interaction.user,
    });

    await queue.play(track);

    return interaction.editReply({
      content: `
        🎶 | Playing the **${track.title}**\n
        Requested by: ${interaction.user.username}\n
        URL: ${url}
      `,
    });
  },
};
