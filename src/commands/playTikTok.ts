import https from 'https';
import { Readable } from 'stream';
import { Queue } from 'discord-player';

import { BaseCommand, CommandDeps } from '../BaseCommand';
import { ValidDcInteraction } from '../bot';
import { Logger } from '../logger';

export class PlayTikTok extends BaseCommand {
  constructor(deps: CommandDeps) {
    super(deps, {
      name: 'tiktok',
      description: 'allows to stream audio from tiktok',
      options: [
        {
          name: 'url',
          type: 3,
          description: 'The url to tiktok video',
          required: true,
        },
      ],
    });
  }

  async execute({
    interaction,
    queue,
  }: {
    interaction: ValidDcInteraction;
    queue: Queue<unknown>;
  }): Promise<void> {
    const isRequired = true;
    const urlToPlay = interaction.options
      .get('url', isRequired)
      .value?.toString();
    const readStream = await this.fetchTikTokVideo({ logger: this.logger })({
      videoUrl: urlToPlay as string,
    });
    await queue.connection.playStream(
      queue.connection.createStream(readStream)
    );
    const {
      user: { username },
    } = interaction;
    await interaction.channel.send(`Playing\nRequested by: ${username}`);
  }

  private fetchTikTokVideo({ logger }: { logger: Logger }) {
    return ({ videoUrl }: { videoUrl: string }) =>
      new Promise<Readable>((resolve, reject) => {
        https
          .get(videoUrl, (response) => {
            resolve(response);
          })
          .on('error', (err) => {
            logger.error(
              { err, videoUrl },
              'Error during fetching a video from tiktok'
            );
            reject(err);
          });
      });
  }
}
