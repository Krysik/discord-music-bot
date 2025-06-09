import { describe, expect, it, vi } from 'vitest';
import { PauseCommand } from './pause';

describe('pause command', () => {
  it('should pause the current track if queue is playing', async () => {
    const replyMock = vi.fn();
    const setPausedMock = vi.fn();

    await PauseCommand.execute({
      queue: {
        isPlaying: () => true,
        node: {
          isPaused: () => false,
          setPaused: setPausedMock,
        },
      },
      interaction: {
        reply: replyMock,
      },
    } as any);

    expect(setPausedMock).toBeCalledWith(true);
    expect(setPausedMock).toBeCalledTimes(1);
    expect(replyMock).toBeCalledWith({
      content: 'Track has been paused',
    });
  });

  it('should reply with an information that no track is playing', async () => {
    const replyMock = vi.fn();
    const setPausedMock = vi.fn();

    await PauseCommand.execute({
      queue: {
        isPlaying: () => false,
        node: {
          isPaused: () => false,
          setPaused: setPausedMock,
        },
      },
      interaction: {
        reply: replyMock,
      },
    } as any);

    expect(setPausedMock).toBeCalledTimes(0);
    expect(replyMock).toBeCalledWith({
      content: 'Nothing is playing',
      ephemeral: true,
    });
  });
});
