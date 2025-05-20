import { Injectable } from '@angular/core';
import { Player } from './player.model';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  createPlayers(playerCount: number): Array<Player> {
    if (playerCount === 2) {
      return [new Player('blue'), new Player('red')];
    } else if (playerCount === 3) {
      return [
        new Player('blue'),
        new Player('red'),
        new Player('yellow'),
      ];
    } else if (playerCount === 4) {
      return [
        new Player('blue'),
        new Player('red'),
        new Player('yellow'),
        new Player('green'),
      ];
    }
    throw new Error('Invalid player count');
  }
}
