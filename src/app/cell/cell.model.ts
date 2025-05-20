import { Player } from '../player/player.model';

export class Cell {
  value: number = 0;
  advocate?: Player = undefined;
  paragraphStone?: Player = undefined;
}
