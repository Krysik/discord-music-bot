import type { GuildQueue, Player } from 'discord-player';
import type {
  CacheType,
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
  SlashCommandBuilder,
} from 'discord.js';
import type { Logger } from './logger';

type DiscordCommandDeps = {
  queue: GuildQueue;
  interaction: ChatInputCommandInteraction<CacheType>;
  player: Player;
  logger: Logger;
};

export interface DiscordCommand {
  data: SlashCommandBuilder;
  execute: (
    deps: DiscordCommandDeps
  ) => Promise<InteractionResponse<boolean> | Message<boolean>>;
}
