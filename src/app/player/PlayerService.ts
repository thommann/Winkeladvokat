import {Injectable} from '@angular/core';
import {Player} from './Player';

@Injectable({
  providedIn: 'root'
})

export class PlayerService {
  private playerCount = 0;
  public players: Player[] = [];
  public starter: number = 0;

  initializePlayers(playerCount: number): void {
    this.setPlayerCount(playerCount);
    this.chooseStarter()
    this.createPlayers()
  }

  setPlayerCount(playerCount: number) : void {
    this.playerCount = playerCount;
  }

  chooseStarter (): number {
    this.starter = Math.random() * (this.playerCount - 1) + 1;
    return this.starter;
  }

  createPlayers () : void {
    if (this.playerCount === 2) {
      this.players = [
        new Player("red", 25),
        new Player("blue", 25),
      ]
    }
    else if (this.playerCount === 3) {

      this.players = [
        new Player("red", 15),
        new Player("blue", 15),
        new Player("green", 15),
      ]
    }
    else if (this.playerCount === 4) {
      this.players = [
        new Player("red", 15),
        new Player("blue", 15),
        new Player("green", 15),
        new Player("yellow", 15),
      ]
    }
    else {
      throw new Error('Players cannot have at least one player');
    }
  }

  getNextPlayer(index: number ): Player {
    if (index >= this.playerCount) {
      return this.players[0];
    }
    else {
      return this.players[this.playerCount + 1];
    }
  }
}
