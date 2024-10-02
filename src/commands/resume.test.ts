import { describe, expect, it, vi } from 'vitest';
import { ResumeCommand } from './resume';

describe('resume command', () => {
  it('should unpause the current track if queue is paused', async () => {
    const replyMock = vi.fn();
    const setPausedMock = vi.fn();

    await ResumeCommand.execute({
      queue: {
        playing: true,
        setPaused: setPausedMock,
      },
      interaction: {
        reply: replyMock,
      },
    } as any);

    expect(setPausedMock).toBeCalledWith(false);
    expect(replyMock).toBeCalledWith({
      content: 'Track has been resumed',
    });
  });

  it('should reply with an information that no track is playing', async () => {
    const replyMock = vi.fn();
    const setPausedMock = vi.fn();

    await ResumeCommand.execute({
      queue: {
        playing: false,
        setPaused: setPausedMock,
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
