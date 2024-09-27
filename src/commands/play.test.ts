import { describe, expect, it, vi } from 'vitest';
import { PlayCommand } from './play';
import { logger } from '../logger';

describe('play command', () => {
  it('should require the command executor to be in a voice channel', async () => {
    const replyMock = vi.fn();

    await PlayCommand.execute({
      logger,
      interaction: {
        member: { voice: { channel: null } },
        reply: replyMock,
      } as any,
      queue: {} as any,
    });

    expect(replyMock).toBeCalledWith({
      content: 'You must be in a voice channel to use this command',
      ephemeral: true,
    });
  });
});
