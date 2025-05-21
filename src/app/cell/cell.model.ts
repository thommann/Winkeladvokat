import { Player } from '../player/player.model';

export class Cell {
  value: number = 0;
  distance?: number = undefined;
  advocate?: Player;
  paragraph?: Player;
}
