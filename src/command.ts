import { Queue } from 'discord-player';
import {
  CacheType,
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
  SlashCommandBuilder,
} from 'discord.js';
import { Logger } from './logger';

type DiscordCommandDeps = {
  queue: Queue;
  interaction: ChatInputCommandInteraction<CacheType>;
  logger: Logger;
};

export interface DiscordCommand {
  data: SlashCommandBuilder;
  execute: (
    deps: DiscordCommandDeps
  ) => Promise<InteractionResponse<boolean> | Message<boolean>>;
}
