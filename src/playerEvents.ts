import { GuildQueueEvent, Player as DiscordPlayer } from 'discord-player';

import { Logger } from './logger';

export { registerPlayerEvents };

interface PlayerEventsDeps {
  player: DiscordPlayer;
  logger: Logger;
}

// `player.events` is a separate emitter from `player` itself - queue and
// playback errors are emitted there asynchronously, long after `player.play()`
// has already resolved. Without these listeners a failing stream is silent.
//
// `willPlayTrack` and `willAutoPlay` are deliberately left out: they are gates
// that must call their `done()` callback, not notifications. Logging one
// without calling `done()` would stall playback forever.
function registerPlayerEvents({ player, logger }: PlayerEventsDeps) {
  player.on('error', (err) => {
    logger.error({ err }, 'Player error');
  });

  player.on('debug', (message) => {
    logger.debug({ message }, 'Player debug');
  });

  player.events.on(GuildQueueEvent.PlayerStart, (queue, track) => {
    logger.info(
      { guildId: queue.guild.id, track: track.title, url: track.url },
      'Started playing a track'
    );
  });

  player.events.on(GuildQueueEvent.PlayerError, (queue, err, track) => {
    logger.error(
      { err, guildId: queue.guild.id, track: track.title, url: track.url },
      'Error while streaming a track'
    );
  });

  player.events.on(GuildQueueEvent.Error, (queue, err) => {
    logger.error({ err, guildId: queue.guild.id }, 'Queue error');
  });

  player.events.on(GuildQueueEvent.PlayerFinish, (queue, track) => {
    logger.info(
      { guildId: queue.guild.id, track: track.title },
      'Finished playing a track'
    );
  });

  player.events.on(
    GuildQueueEvent.PlayerSkip,
    (queue, track, reason, description) => {
      logger.warn(
        { guildId: queue.guild.id, track: track.title, reason, description },
        'Track has been skipped'
      );
    }
  );

  player.events.on(GuildQueueEvent.Disconnect, (queue) => {
    logger.warn({ guildId: queue.guild.id }, 'Disconnected from voice channel');
  });

  player.events.on(GuildQueueEvent.ConnectionDestroyed, (queue) => {
    logger.warn({ guildId: queue.guild.id }, 'Voice connection destroyed');
  });

  player.events.on(GuildQueueEvent.Connection, (queue) => {
    logger.debug({ guildId: queue.guild.id }, 'Voice connection established');
  });

  player.events.on(GuildQueueEvent.EmptyQueue, (queue) => {
    logger.debug({ guildId: queue.guild.id }, 'The queue is empty');
  });

  player.events.on(GuildQueueEvent.EmptyChannel, (queue) => {
    logger.debug({ guildId: queue.guild.id }, 'The voice channel is empty');
  });

  player.events.on(GuildQueueEvent.Debug, (queue, message) => {
    logger.debug({ guildId: queue.guild.id, message }, 'Queue debug');
  });
}
