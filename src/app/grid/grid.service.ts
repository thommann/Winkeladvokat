import { Injectable } from '@angular/core';
import { Player } from '../player/player.model';

@Injectable({
  providedIn: 'root',
})
export class GridService {
  private gridSize: number = 6

  public getGridSize(): number {
    return this.gridSize;
  }

  public setGridSize(gridSize: number) {
    this.gridSize = gridSize;
  }

  getPlayerIndexForCorner(i: number, j: number): number | undefined {
    const gridSize = this.getGridSize();
    if (i == 0 && j == 0) {
      return 0;
    }
    if (i == 0 && j == gridSize - 1) {
      return 1;
    }
    if (i == gridSize - 1 && j == gridSize - 1) {
      return 2;
    }
    if (i == gridSize - 1 && j == 0) {
      return 3;
    }
    return undefined;
  }
}
