import { Injectable } from '@angular/core';
import { Player } from '../player/player.model';
import { Game } from './game.model';
import { PlayerService } from '../player/player.service';
import { GridService } from '../grid/grid.service';
import { Cell } from '../cell/cell.model';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private game: Game;
  public grid: Cell[][] = [];

  constructor(
    private playerService: PlayerService,
    private gridService: GridService
  ) {
    this.game = new Game();
  }

  initializeGrid(): void {
    this.grid = [];
    const gridSize = this.gridService.getGridSize();

    for (let i = 0; i < gridSize; i++) {
      const row = [];
      for (let j = 0; j < gridSize; j++) {
        let points = 0;

        const isCorner =
          (i === 0 && (j === 0 || j === gridSize - 1)) ||
          (i === gridSize - 1 && (j === 0 || j === gridSize - 1));

        const distance = Math.min(i, j, gridSize - 1 - i, gridSize - 1 - j) + 1;
        if (!isCorner) {
          points = Math.pow(2, distance);
        }

        row.push({
          value: points,
          distance: distance,
          advocate: this.getStartingPlayer(i, j),
        } satisfies Cell);
      }
      this.grid.push(row);
    }
  }

  cellSelected(targetRow: number, targetColumn: number): void {
    let targetCell = this.grid[targetRow][targetColumn];
    if (targetCell.advocate || targetCell.paragraph) {
      if (!this.game.isLocked) {
        this.game.selectedCell = [targetRow, targetColumn];
      }
    } else if (this.game.selectedCell) {
      const sourceCellCoordinates = this.game.selectedCell;
      const sourceCellRow = sourceCellCoordinates[0];
      const sourceCellColumn = sourceCellCoordinates[1];
      if (sourceCellRow === targetRow || sourceCellColumn === targetColumn) {
        const sourceCell = this.grid[sourceCellRow][sourceCellColumn];
        if (
          sourceCell.paragraph &&
          !this.game.isLocked &&
          this.isParagraphMoveValid(
            sourceCellRow,
            sourceCellColumn,
            targetRow,
            targetColumn
          )
        ) {
          targetCell = this.moveParagraph(targetRow, targetColumn, sourceCell);
          const cellInBetween = this.getCellInBetween(
            sourceCellRow,
            sourceCellColumn,
            targetRow,
            targetColumn
          );
          cellInBetween.paragraph = undefined;
          targetCell.paragraph!.eaten++;
        }
        if (sourceCell.advocate) {
          this.moveAdvocate(targetRow, targetColumn, sourceCell);
        }
      }
    }
  }

  private moveParagraph(
    targetRow: number,
    targetColumn: number,
    sourceCell: Cell
  ): Cell {
    this.grid[targetRow][targetColumn].paragraph = sourceCell.paragraph;
    sourceCell.paragraph = undefined;
    this.game.selectedCell = [targetRow, targetColumn];
    return this.grid[targetRow][targetColumn];
  }

  private moveAdvocate(
    targetRow: number,
    targetColumn: number,
    sourceCell: Cell
  ): void {
    this.grid[targetRow][targetColumn].advocate = sourceCell.advocate;
    sourceCell.advocate = undefined;
    this.game.selectedCell = [targetRow, targetColumn];
    if (this.game.isLocked) {
      sourceCell.paragraph = this.grid[targetRow][targetColumn].advocate;
      this.game.isLocked = false;
    } else {
      this.game.isLocked = true;
    }
  }

  getSelectedCell(): number[] | undefined {
    return this.game.selectedCell;
  }

  getStartingPlayer(i: number, j: number): Player | undefined {
    const playerIndex = this.gridService.getPlayerIndexForCorner(i, j);
    return playerIndex !== undefined
      ? this.game.players.at(playerIndex)
      : undefined;
  }

  initializePlayers(playerCount: number): void {
    this.setPlayerCount(playerCount);
    this.setStarter();
    this.game.players = this.playerService.createPlayers(playerCount);
  }

  getPlayerScore(playerColor: string): number {
    const eaten =
      this.game.players.find((player) => player.color === playerColor)?.eaten ??
      0;
    const paragraphPoints = this.getPlayerParagraphPoints(playerColor);
    return eaten + paragraphPoints;
  }

  private getPlayerParagraphPoints(playerColor: string): number {
    let sum = 0;
    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid[i].length; j++) {
        const cell = this.grid[i][j];
        if (cell.paragraph?.color === playerColor) {
          sum += cell.value;
        }
      }
    }
    return sum;
  }

  getPlayers(): Player[] {
    return this.game.players;
  }

  getCurrentPlayer(): Player {
    return this.game.players[this.game.turnIndex];
  }

  private setPlayerCount(playerCount: number): void {
    if (playerCount < 2 || playerCount > 4) {
      throw new Error(
        'Player count must not be greater than 4 or less than 2 players'
      );
    }

    this.game.playerCount = playerCount;
  }

  private setStarter(): void {
    this.game.turnIndex = Math.floor(Math.random() * this.game.playerCount);
  }

  private isParagraphMoveValid(
    sourceCellRow: number,
    sourceCellColumn: number,
    targetRow: number,
    targetColumn: number
  ) {
    if (sourceCellRow === targetRow) {
      return Math.abs(sourceCellColumn - targetColumn) === 2;
    }
    if (sourceCellColumn === targetColumn) {
      return Math.abs(sourceCellRow - targetRow) === 2;
    }
    return false;
  }

  private getCellInBetween(
    sourceCellRow: number,
    sourceCellColumn: number,
    targetRow: number,
    targetColumn: number
  ) {
    if (sourceCellRow === targetRow) {
      return this.grid[sourceCellRow][(sourceCellColumn + targetColumn) / 2];
    }
    if (sourceCellColumn === targetColumn) {
      return this.grid[(sourceCellRow + targetRow) / 2][sourceCellColumn];
    }
    throw new Error();
  }
}
