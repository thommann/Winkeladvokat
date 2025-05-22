import {Player} from '../player/player.model';
import {Cell} from '../cell/cell.model';

export class Game {
  public playerCount = 0;
  public players: Player[] = [];
  public turnIndex: number = 0;
  public selectedCell: number[] | undefined = undefined;
  public winkelSource: number[] | undefined = undefined;
  public grid: Cell[][] = [];

}
