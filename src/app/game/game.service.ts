import {Injectable} from '@angular/core';
import {Player} from '../player/player.model';
import {Game} from './game.model';
import {PlayerService} from '../player/player.service';
import {GridService} from '../grid/grid.service';
import {Cell} from '../cell/cell.model';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private game: Game;
  public grid: Cell[][] = [];

  constructor(
    private playerService: PlayerService,
    private gridService: GridService,
  ){
    this.game = new Game();
  }

  initializeGrid(): void {
    this.grid = [];
    const gridSize = this.gridService.getGridSize();

    for (let i = 0; i < gridSize; i++) {
      const row = [];
      for (let j = 0; j < gridSize; j++) {
        let points = 0;

        const isCorner =
          (i === 0 && (j === 0 || j === gridSize - 1)) ||
          (i === gridSize - 1 && (j === 0 || j === gridSize - 1));

        if (!isCorner) {
          const ring = Math.min(i, j, gridSize - 1 - i, gridSize - 1 - j);
          points = Math.pow(2, ring + 1);
        }

        row.push({
          selected: false,
          value: points,
          advocate: this.getStartingPlayer(i, j),
        } satisfies Cell);
      }
      this.grid.push(row);
    }
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
