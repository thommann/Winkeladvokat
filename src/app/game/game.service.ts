import {Injectable} from '@angular/core';
import {Player} from '../player/player.model';
import {Game} from './game.model';
import {PlayerService} from '../player/player.service';
import {GridService} from '../grid/grid.service';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private game: Game;
  constructor(
    private playerService: PlayerService,
    private gridService: GridService,
  ){
    this.game = new Game();
  }

  getStartingPlayer(i: number, j: number): Player | undefined {
    const playerIndex = this.gridService.getPlayerIndexForCorner(i, j);
    return playerIndex !== undefined ? this.game.players.at(playerIndex) : undefined;
  }

  initializePlayers(playerCount: number): void {
    this.setPlayerCount(playerCount);
    this.setStarter();
    this.game.players = this.playerService.createPlayers(playerCount);
  }

  getPlayerCount(): number {
    return this.game.playerCount;
  }

  getPlayers(): Player[] {
    return this.game.players;
  }

  getNextPlayer(): Player {
    if (this.game.turnIndex === this.game.playerCount) {
      this.game.turnIndex = 0;
    }
    return this.game.players[this.game.turnIndex++];
  }

  private setPlayerCount(playerCount: number): void {
    if (playerCount < 2 || playerCount > 4) {
      throw new Error(
        'Player count must not be greater than 4 or less than 2 players'
      );
    }

    this.game.playerCount = playerCount;
  }

  private setStarter(): void {
    this.game.turnIndex = Math.floor(Math.random() * this.game.playerCount);
  }
}
