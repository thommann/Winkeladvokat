import { Player } from '../player/player.model';

export class Cell {
  selected: boolean = false;
  value: number = 0;
  advocate?: Player = undefined;
  paragraph?: Player = undefined;
}
