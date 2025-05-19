import {Player} from '../player/Player';

export class CellState {
  selected: boolean = false
  backgroundColor: string = "#fff"
  value: number = 0
  advocate?: Player = undefined
}
