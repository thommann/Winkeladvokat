import {Player} from '../player/player.model';

export class Game {
  public playerCount = 0;
  public players: Player[] = [];
  public turnIndex: number = 0;
  public selectedCell: number[] | undefined = undefined;

  constructor() {
  }

}
