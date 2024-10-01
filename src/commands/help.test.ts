import { describe, expect, it, vi } from 'vitest';
import { HelpCommand } from './help';

describe('help command', () => {
  it('should build the help message', async () => {
    const replyMock = vi.fn();

    await HelpCommand.execute({
      interaction: {
        reply: replyMock,
      },
    } as any);

    expect(replyMock).toBeCalledWith({
      content:
        'Available commands\n' +
        'cmd: **ping** - Pings the bot\n' +
        '\n' +
        'cmd: **play** - Plays a track\n' +
        '\n' +
        '            - **url** (required: Yes): The url to song you want to play\n' +
        '          \n' +
        'cmd: **stop** - stops a track\n' +
        '\n' +
        'cmd: **help** - Displays available commands\n' +
        '\n' +
        'cmd: **pause** - Pauses the current track\n' +
        '\n' +
        'cmd: **resume** - Resumes paused track\n' +
        '\n',
      ephemeral: true,
    });
  });
});
