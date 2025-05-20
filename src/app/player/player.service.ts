import {Injectable} from '@angular/core';
import {Player} from './player.model';

@Injectable({
  providedIn: 'root'
})

export class PlayerService {
  private playerCount = 0;
  public players: Player[] = [];
  public starterIndex: number = 0;

  initializePlayers(playerCount: number): void {
    this.setPlayerCount(playerCount);
    this.setStarter()
    this.createPlayers()
  }

  getNextPlayer(): Player {
    if (this.starterIndex === this.playerCount) {
      this.starterIndex = 0;
    }
    return this.players[this.starterIndex++];
  }

  private setPlayerCount(playerCount: number): void {
    if (playerCount < 2 || playerCount > 4) {
      throw new Error('Player count must not be greater than 4 or less than 2 players');
    }

    this.playerCount = playerCount;
  }

  private setStarter(): void {
    this.starterIndex = Math.floor(Math.random() * this.playerCount);
  }

  private createPlayers(): void {
    if (this.playerCount === 2) {
      this.players = [
        new Player("blue", 25),
        new Player("red", 25),
      ]
    } else if (this.playerCount === 3) {

      this.players = [
        new Player("blue", 15),
        new Player("red", 15),
        new Player("yellow", 15),
      ]
    } else if (this.playerCount === 4) {
      this.players = [
        new Player("blue", 15),
        new Player("red", 15),
        new Player("yellow", 15),
        new Player("green", 15),
      ]
    }
  }
}
