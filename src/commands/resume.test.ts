import { describe, expect, it, vi } from 'vitest';
import { ResumeCommand } from './resume';

describe('resume command', () => {
  it('should resume the current track if queue is paused', async () => {
    const replyMock = vi.fn();
    const resumeMock = vi.fn();

    await ResumeCommand.execute({
      queue: {
        isPlaying: () => true,
        node: {
          isPaused: () => true,
          resume: resumeMock,
        },
      },
      interaction: {
        reply: replyMock,
      },
    } as any);

    expect(resumeMock).toBeCalledTimes(1);
    expect(replyMock).toBeCalledWith({
      content: 'Track has been resumed',
    });
  });

  it('should reply with an information that no track is playing', async () => {
    const replyMock = vi.fn();
    const resumeMock = vi.fn();

    await ResumeCommand.execute({
      queue: {
        isPlaying: () => false,
        node: {
          isPaused: () => false,
          resume: resumeMock,
        },
      },
      interaction: {
        reply: replyMock,
      },
    } as any);

    expect(resumeMock).toBeCalledTimes(0);
    expect(replyMock).toBeCalledWith({
      content: 'Nothing is playing or track is not paused',
      ephemeral: true,
    });
  });
});
