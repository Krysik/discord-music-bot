import { describe, expect, it, vi } from 'vitest';
import { StopCommand } from './stop';

describe('stop command', () => {
  it('should stop the current track if queue is playing', async () => {
    const replyMock = vi.fn();
    const queueStopMock = vi.fn();

    await StopCommand.execute({
      queue: {
        playing: true,
        stop: queueStopMock,
      },
      interaction: {
        reply: replyMock,
      },
    } as any);

    expect(queueStopMock).toBeCalled();
    expect(replyMock).toBeCalledWith({
      content: 'The track has been stopped',
    });
  });

  it('should reply with an information that no track is playing', async () => {
    const replyMock = vi.fn();
    const queueStopMock = vi.fn();

    await StopCommand.execute({
      queue: {
        playing: false,
        stop: queueStopMock,
      },
      interaction: {
        reply: replyMock,
      },
    } as any);

    expect(queueStopMock).not.toBeCalled();
    expect(replyMock).toBeCalledWith({
      content: 'Nothing is playing',
      ephemeral: true,
    });
  });
});
