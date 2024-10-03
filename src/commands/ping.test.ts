import { describe, expect, it, vi } from 'vitest';
import { PingCommand } from './ping';

describe('ping command', () => {
  it('should reply with pong', async () => {
    const replyMock = vi.fn();

    await PingCommand.execute({
      interaction: {
        reply: replyMock,
      },
    } as any);

    expect(replyMock).toBeCalledWith({
      content: 'Pong!',
    });
  });
});
