import { Player, Queue, Track } from 'discord-player';
import { CacheType, CommandInteraction, User } from 'discord.js';
import { YouTube } from 'youtube-sr';
import { BaseCommand, CommandDeps } from '../BaseCommand';

export class PlayCmd extends BaseCommand {
  constructor(deps: CommandDeps) {
    super(deps, {
      name: 'play',
      description: 'plays a song',
      options: [
        {
          name: 'url',
          type: 3,
          description: 'The url to song you want to play',
          required: true,
        },
      ],
    });
  }

  async execute(
    {
      interaction,
      queue,
    }: { interaction: CommandInteraction<CacheType>; queue: Queue },
    { url }: { url?: string }
  ) {
    const passedUrl = url || interaction.options.get('url')?.value;
    if (!passedUrl) {
      this.logger.error('empty url');
      return;
    }
    const track = await this.getTrack(this.player)({
      url: passedUrl as string,
      requestedBy: interaction.user,
    });

    if (interaction.channel) {
      await interaction.channel.send(`Playing`);
    }
    this.logger.info(`playing ${track.title}`);
    await queue.play(track);
  }

  getTrack(player: Player) {
    return async ({ url, requestedBy }: { url: string; requestedBy: User }) => {
      const video = await YouTube.getVideo(url);

      return new Track(player, {
        title: video.title as string,
        description: video.description || '',
        author: '',
        requestedBy,
        source: 'youtube',
        url: video.url,
        raw: video,
        duration: video.duration.toString(),
        thumbnail: video.thumbnail?.url || '',
        views: video.views,
      });
    };
  }
}
