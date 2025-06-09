import { type GuildMember, SlashCommandBuilder } from 'discord.js';
import type { DiscordCommand } from '../command';

export { PlayCommand };

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
    const cmdInitiator = interaction.member as GuildMember;

    if (!cmdInitiator.voice.channel) {
      logger.warn({ cmdInitiator }, 'User is not in a voice channel');
      return interaction.reply({
        content: 'You must be in a voice channel to use this command',
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    const url = interaction.options.getString('url', isRequired);

    if (!queue.connection) {
      await queue.connect(cmdInitiator.voice.channel);
    }

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
            ephemeral: true,
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
