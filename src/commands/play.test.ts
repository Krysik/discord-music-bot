import { describe, expect, it, vi } from 'vitest';
import { ChannelType } from 'discord.js';
import { PlayCommand } from './play';
import { logger } from '../logger';

describe('play command', () => {
  it('should play a track from a url', async () => {
    const trackUrl = 'https://test-url';
    const testUsername = 'testUser';
    const testTrackTitle = 'test-track-title';

    const deferReplyMock = vi.fn();
    const editReplyMock = vi.fn();
    const queueConnectMock = vi.fn();
    const getCommandParamMock = vi.fn().mockReturnValueOnce(trackUrl);
    const playMock = vi.fn().mockResolvedValueOnce({
      track: {
        title: testTrackTitle,
      },
    });

    await PlayCommand.execute({
      logger,
      interaction: {
        member: { voice: { channel: { type: ChannelType.GuildVoice } } },
        editReply: editReplyMock,
        deferReply: deferReplyMock,
        options: {
          getString: getCommandParamMock,
        },
        user: { username: testUsername },
      } as any,
      queue: {
        connect: queueConnectMock,
        player: {
          play: playMock,
        },
      } as any,
    });

    expect(deferReplyMock).toBeCalledTimes(1);
    expect(queueConnectMock).toBeCalledTimes(1);
    expect(playMock).toBeCalledTimes(1);

    expect(editReplyMock).toBeCalledWith({
      content: `
          🎶 | Playing the **${testTrackTitle}**\n
          Requested by: ${testUsername}\n
          URL: ${trackUrl}
        `,
    });
  });

  it('should not try connect the queue if it is already connected', async () => {
    const trackUrl = 'https://test-url';
    const testUsername = 'testUser';
    const testTrackTitle = 'test-track-title';

    const deferReplyMock = vi.fn();
    const editReplyMock = vi.fn();
    const queueConnectMock = vi.fn();
    const getCommandParamMock = vi.fn().mockReturnValueOnce(trackUrl);
    const playMock = vi.fn().mockResolvedValueOnce({
      track: {
        title: testTrackTitle,
      },
    });

    await PlayCommand.execute({
      logger,
      interaction: {
        member: { voice: { channel: { type: ChannelType.GuildVoice } } },
        editReply: editReplyMock,
        deferReply: deferReplyMock,
        options: {
          getString: getCommandParamMock,
        },
        user: { username: testUsername },
      } as any,
      queue: {
        connect: queueConnectMock,
        connection: { paused: false },
        player: {
          play: playMock,
        },
      } as any,
    });

    expect(deferReplyMock).toBeCalledTimes(1);
    expect(queueConnectMock).toBeCalledTimes(0);
  });

  it('should require the command executor to be in a voice channel', async () => {
    const replyMock = vi.fn();
    const editReplyMock = vi.fn();

    await PlayCommand.execute({
      logger,
      interaction: {
        member: { voice: { channel: null } },
        reply: replyMock,
        editReply: editReplyMock,
      } as any,
      queue: {} as any,
    });

    expect(replyMock).toBeCalledWith({
      content: 'You must be in a voice channel to use this command',
      ephemeral: true,
    });
    expect(editReplyMock).not.toBeCalled();
  });

  it('should reply with an information that a track was not found', async () => {
    // Discord player does not export this error
    class NoResultError extends Error {
      public readonly code = 'ERR_NO_RESULT';
    }

    const trackUrl = 'https://test-url';
    const deferReplyMock = vi.fn();
    const getCommandParamMock = vi.fn().mockReturnValueOnce(trackUrl);
    const editReplyMock = vi.fn();
    const queueConnectMock = vi.fn();
    const playMock = vi.fn().mockRejectedValueOnce(new NoResultError());

    await PlayCommand.execute({
      logger,
      interaction: {
        member: { voice: { channel: { type: ChannelType.GuildVoice } } },
        editReply: editReplyMock,
        deferReply: deferReplyMock,
        options: {
          getString: getCommandParamMock,
        },
      } as any,
      queue: {
        connect: queueConnectMock,
        player: {
          play: playMock,
        },
      } as any,
    });

    expect(playMock).toBeCalledTimes(1);
    expect(editReplyMock).toBeCalledWith({
      content: `Track not found for a given URL\n${trackUrl}`,
      options: {
        ephemeral: true,
      },
    });
    expect(queueConnectMock).toBeCalledTimes(1);
  });
});
