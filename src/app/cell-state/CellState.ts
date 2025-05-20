import { Player } from '../player/player.model';

export class CellState {
  selected: boolean = false;
  backgroundColor: string = '#fff';
  value: number = 0;
  advocate?: Player = undefined;
}
