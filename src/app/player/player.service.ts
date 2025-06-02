// src/app/player/player.service.ts
import { Injectable } from '@angular/core';
import { Player } from './player.model';
import { GAME_CONFIG, GameConfigHelper, PlayerColor } from '../game/game.config';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  createPlayers(playerCount: number): Array<Player> {
    // Use the config helper for validation
    if (!GameConfigHelper.isValidPlayerCount(playerCount)) {
      throw new Error(
        `Invalid player count: ${playerCount}. Must be between ${GAME_CONFIG.PLAYERS.MIN_COUNT} and ${GAME_CONFIG.PLAYERS.MAX_COUNT}`
      );
    }

    // Use the config helper to get the right colors
    const colors = GameConfigHelper.getPlayerColorsForCount(playerCount);

    return colors.map(color => new Player(color, GAME_CONFIG.PLAYERS.STARTING_EATEN));
  }

  createPlayer(color: PlayerColor, eaten: number = GAME_CONFIG.PLAYERS.STARTING_EATEN): Player {
    return new Player(color, eaten);
  }

  getAvailableColors(): readonly PlayerColor[] {
    return GAME_CONFIG.PLAYERS.COLORS;
  }
}
