import {
  type GuildMember,
  SlashCommandBuilder,
  MessageFlags,
} from 'discord.js';
import type { DiscordCommand } from '../command';

export { PlayCommand };

const PlayCommand: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setDescription('Plays a track')
    .setName('play')
    .addStringOption((option) =>
      option
        .setName('url')
        .setDescription('The url to song you want to play')
        .setRequired(true)
    ) as SlashCommandBuilder,

  async execute({ interaction, queue, logger }) {
    const isRequired = true;
    const cmdInitiator = interaction.member as GuildMember;

    if (!cmdInitiator.voice.channel) {
      logger.warn({ cmdInitiator }, 'User is not in a voice channel');
      return interaction.reply({
        content: 'You must be in a voice channel to use this command',
        options: {
          flags: MessageFlags.Ephemeral,
        },
      });
    }

    await interaction.deferReply();

    const urlOption = interaction.options.get('url', isRequired);

    if (!queue.connection) {
      await queue.connect(cmdInitiator.voice.channel);
    }

    if (typeof urlOption.value !== 'string') {
      return interaction.editReply({
        content: 'Invalid URL',
        options: {
          flags: MessageFlags.Ephemeral,
        },
      });
    }
    const url = urlOption.value;

    try {
      const { track } = await queue.player.play(
        cmdInitiator.voice.channel,
        url,
        {
          requestedBy: interaction.user,
        }
      );

      return interaction.editReply({
        content: `
          🎶 | Playing the **${track.title}**\n
          Requested by: ${interaction.user.username}\n
          URL: ${url}
        `,
      });
    } catch (err) {
      logger.error({ err }, 'Error while playing a track');
      if (isNotFoundError(err)) {
        return interaction.editReply({
          content: `Track not found for a given URL\n${url}`,
          options: {
            flags: MessageFlags.Ephemeral,
          },
        });
      }

      throw err;
    }
  },
};

const isNotFoundError = (err: unknown): err is { code: string } => {
  const trackNotFoundErrCode = 'ERR_NO_RESULT';

  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: unknown }).code === trackNotFoundErrCode
  );
};
