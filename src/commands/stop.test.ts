import { describe, expect, it, vi } from 'vitest';
import { StopCommand } from './stop';

describe('stop command', () => {
  it('should stop the current track if queue is playing', async () => {
    const replyMock = vi.fn();
    const stopMock = vi.fn();

    await StopCommand.execute({
      queue: {
        isPlaying: () => true,
        node: {
          stop: stopMock,
        },
      },
      interaction: {
        reply: replyMock,
      },
    } as any);

    expect(stopMock).toBeCalledTimes(1);
    expect(replyMock).toBeCalledWith({
      content: 'The track has been stopped',
    });
  });

  it('should reply with an information that no track is currently playing', async () => {
    const replyMock = vi.fn();
    const stopMock = vi.fn();

    await StopCommand.execute({
      queue: {
        isPlaying: () => false,
        node: {
          stop: stopMock,
        },
      },
      interaction: {
        reply: replyMock,
      },
    } as any);

    expect(stopMock).toBeCalledTimes(0);
    expect(replyMock).toBeCalledWith({
      content: 'Nothing is playing',
      ephemeral: true,
    });
  });
});
