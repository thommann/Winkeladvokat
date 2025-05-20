import { Player } from '../player/player.model';

export class Cell {
  selected: boolean = false;
  backgroundColor: string = '#fff';
  value: number = 0;
  advocate?: Player = undefined;
  paragraphStone?: Player = undefined;
}
