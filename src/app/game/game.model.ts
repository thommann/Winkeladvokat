// src/app/game/game.model.ts
import { Player } from '../player/player.model';
import { Cell } from '../cell/cell.model';
import { Position } from './position.model';

export class Game {
  public playerCount = 0;
  public players: Player[] = [];
  public turnIndex: number = 0;
  public selectedCell: Position | undefined = undefined;
  public winkelSource: Position | undefined = undefined;
  public grid: Cell[][] = [];
}
