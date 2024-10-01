import { describe, expect, it, vi } from 'vitest';
import { PauseCommand } from './pause';

describe('pause command', () => {
  it('should pause the current track if queue is playing', async () => {
    const replyMock = vi.fn();
    const setPausedMock = vi.fn();

    await PauseCommand.execute({
      queue: {
        setPaused: setPausedMock,
        playing: true,
      },
      interaction: {
        reply: replyMock,
      },
    } as any);

    expect(setPausedMock).toBeCalledWith(true);
    expect(replyMock).toBeCalledWith({
      content: 'Track has been paused',
    });
  });

  it('should reply with an information that no track is playing', async () => {
    const replyMock = vi.fn();
    const setPausedMock = vi.fn();

    await PauseCommand.execute({
      queue: {
        setPaused: setPausedMock,
        playing: false,
      },
      interaction: {
        reply: replyMock,
      },
    } as any);

    expect(setPausedMock).not.toBeCalled();
    expect(replyMock).toBeCalledWith({
      content: 'Nothing is playing',
      ephemeral: true,
    });
  });
});
