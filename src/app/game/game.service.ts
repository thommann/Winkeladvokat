// src/app/game/game.service.ts
import { Injectable } from '@angular/core';
import { Player } from '../player/player.model';
import { Game } from './game.model';
import { PlayerService } from '../player/player.service';
import { GridService } from '../grid/grid.service';
import { Cell } from '../cell/cell.model';
import { GameHistory } from './history/gameHistory';
import { Position } from './position.model';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private game: Game;
  private gameHistory: GameHistory;
  public get grid() {
    return this.game.grid;
  }

  constructor(
    private playerService: PlayerService,
    private gridService: GridService,
  ) {
    this.game = new Game();
    this.gameHistory = new GameHistory();
  }

  initializeGrid(): void {
    const grid: Cell[][] = [];
    const gridSize = this.gridService.getGridSize();

    for (let i = 0; i < gridSize; i++) {
      const row: Cell[] = [];
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
          isValidTarget: true,
          validTargetColor: "",
        } satisfies Cell);
      }
      grid.push(row);
    }
    this.game.grid = grid;
    this.game.selectedCell = undefined;
    this.gameHistory.resetHistory()
    this.gameHistory.saveHistory(this.game);
  }

  cellSelected(targetRow: number, targetColumn: number): void {
    const targetPosition = new Position(targetRow, targetColumn);
    let targetCell = this.grid[targetPosition.row][targetPosition.col];

    if (!targetCell.isValidTarget) {
      return;
    }

    if (targetCell.advocate || targetCell.paragraph) {
      this.game.selectedCell = targetPosition;
      this.validateCells();
      return;
    }

    if (this.game.selectedCell) {
      const sourcePosition = this.game.selectedCell;
      const sourceCell = this.grid[sourcePosition.row][sourcePosition.col];

      if (sourceCell.paragraph) {
        targetCell = this.moveParagraph(targetPosition, sourceCell);
        const cellInBetween = this.getCellInBetween(sourcePosition, targetPosition);
        cellInBetween.paragraph = undefined;
        targetCell.paragraph!.eaten++;
        this.validateCells()
        this.gameHistory.saveHistory(this.game);
        return;
      }

      if (sourceCell.advocate) {
        this.moveAdvocate(targetPosition, sourcePosition);
        this.validateCells();
        this.gameHistory.saveHistory(this.game);
        return;
      }
    }
  }

  canUndo() {
    return this.gameHistory.canUndo();
  }

  undoLastMove() {
    if (this.gameHistory.canUndo()) {
      this.game = this.gameHistory.undo()!;
    }
  }

  canRedo() {
    return this.gameHistory.canRedo();
  }

  redoLastMove() {
    if (this.gameHistory.canRedo()) {
      this.game = this.gameHistory.redo()!;
    }
  }

  private invalidateAllCells() {
    const gridSize = this.gridService.getGridSize();
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        this.grid[i][j].isValidTarget = false;
        this.grid[i][j].validTargetColor = "";
      }
    }
  }

  private validateCellsForParagraphAt(
    selectedPosition: Position,
    selectedParagraph: Player,
  ) {
    const validCells = this.getValidCellsForParagraphAt(selectedPosition, selectedParagraph);
    validCells.forEach((position) => {
      this.grid[position.row][position.col].isValidTarget = true;
      this.grid[position.row][position.col].validTargetColor = selectedParagraph.color;
    });
  }

  private getValidCellsForParagraphAt(
    selectedPosition: Position,
    selectedParagraph: Player,
  ) {
    let validCells: Position[] = []
    if (this.isValidCellForParagraphInDirection(selectedPosition, selectedParagraph, -2, 0)) {
      validCells.push(new Position(selectedPosition.row - 2, selectedPosition.col))
    }
    if (this.isValidCellForParagraphInDirection(selectedPosition, selectedParagraph, 2, 0)) {
      validCells.push(new Position(selectedPosition.row + 2, selectedPosition.col))
    }
    if (this.isValidCellForParagraphInDirection(selectedPosition, selectedParagraph, 0, -2)) {
      validCells.push(new Position(selectedPosition.row, selectedPosition.col - 2))
    }
    if (this.isValidCellForParagraphInDirection(selectedPosition, selectedParagraph, 0, 2)) {
      validCells.push(new Position(selectedPosition.row, selectedPosition.col + 2))
    }
    return validCells;
  }

  private isValidCellForParagraphInDirection(
    selectedPosition: Position,
    selectedParagraph: Player,
    rowDiff: number,
    columnDiff: number
  ): boolean {
    const targetPosition = new Position(selectedPosition.row + rowDiff, selectedPosition.col + columnDiff);
    const gridSize = this.gridService.getGridSize();
    if (targetPosition.isValid(gridSize)) {
      const targetCell = this.grid[targetPosition.row][targetPosition.col];
      if (targetCell.paragraph || targetCell.advocate) {
        return false;
      }
      const cellInBetween = this.getCellInBetween(selectedPosition, targetPosition);
      if (cellInBetween.paragraph) {
        if (cellInBetween.paragraph.color !== selectedParagraph.color) {
          return true
        }
      }
    }
    return false;
  }

  private validateAdvocateAt(
    selectedPosition: Position,
    rowDirection: number,
    columnDirection: number,
  ) {
    const gridSize = this.gridService.getGridSize();
    const selectedCell = this.grid[selectedPosition.row][selectedPosition.col];
    let done = false;
    for (let row = selectedPosition.row + rowDirection; row < gridSize && row >= 0; row += rowDirection) {
      for (let column = selectedPosition.col + columnDirection; column < gridSize && column >= 0; column += columnDirection) {
        const targetCell = this.grid[row][column];
        if (targetCell.paragraph || targetCell.advocate) {
          done = true;
          break
        }
        targetCell.isValidTarget = true;
        targetCell.validTargetColor = selectedCell.advocate?.color ?? "";
        if (columnDirection === 0) {
          break
        }
      }
      if (rowDirection === 0 || done) {
        break;
      }
    }
  }

  private validateCellsWithStones() {
    const gridSize = this.gridService.getGridSize();
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const cell = this.grid[i][j];
        if (cell.advocate) {
          cell.isValidTarget = true;
        }
        else if (cell.paragraph) {
          if (this.getValidCellsForParagraphAt(new Position(i, j), cell.paragraph).length > 0) {
            cell.isValidTarget = true;
          }
        }
      }
    }
  }

  private validateCells() {
    if (this.game.selectedCell === undefined) {
      return;
    }
    const selectedPosition = this.game.selectedCell;
    const selectedCell = this.grid[selectedPosition.row][selectedPosition.col];
    if (selectedCell.paragraph) {
      this.invalidateAllCells();
      this.validateCellsWithStones();
      const selectedParagraph = selectedCell.paragraph;
      this.validateCellsForParagraphAt(selectedPosition, selectedParagraph);
    }
    if (selectedCell.advocate) {
      this.invalidateAllCells();
      if (this.game.winkelSource) {
        const winkelSourceCell = this.grid[this.game.winkelSource.row][this.game.winkelSource.col];
        winkelSourceCell.isValidTarget = true;
        winkelSourceCell.validTargetColor = selectedCell.advocate?.color ?? "";
        if (this.game.winkelSource.row === selectedPosition.row) {
          this.validateAdvocateAt(selectedPosition, -1, 0)
          this.validateAdvocateAt(selectedPosition, 1, 0)
        }
        if (this.game.winkelSource.col === selectedPosition.col) {
          this.validateAdvocateAt(selectedPosition, 0, -1)
          this.validateAdvocateAt(selectedPosition, 0, 1)
        }
      }
      else {
        this.validateCellsWithStones();
        this.validateAdvocateAt(selectedPosition, -1, 0)
        this.validateAdvocateAt(selectedPosition, 0, -1)
        this.validateAdvocateAt(selectedPosition, 1, 0)
        this.validateAdvocateAt(selectedPosition, 0, 1)
      }
    }
  }

  private moveParagraph(
    targetPosition: Position,
    sourceCell: Cell
  ): Cell {
    this.grid[targetPosition.row][targetPosition.col].paragraph = sourceCell.paragraph;
    sourceCell.paragraph = undefined;
    this.game.selectedCell = targetPosition;
    return this.grid[targetPosition.row][targetPosition.col];
  }

  private moveAdvocate(
    targetPosition: Position,
    sourcePosition: Position,
  ): void {
    const sourceCell = this.grid[sourcePosition.row][sourcePosition.col];
    this.grid[targetPosition.row][targetPosition.col].advocate = sourceCell.advocate;
    sourceCell.advocate = undefined;
    this.game.selectedCell = targetPosition;
    if (this.game.winkelSource !== undefined) {
      if (!this.game.winkelSource.equals(targetPosition)) {
        sourceCell.paragraph = this.grid[targetPosition.row][targetPosition.col].advocate;
      }
      this.game.winkelSource = undefined;
    } else {
      this.game.winkelSource = sourcePosition;
    }
  }

  getSelectedCell(): Position | undefined {
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

  private getCellInBetween(
    sourcePosition: Position,
    targetPosition: Position
  ) {
    if (sourcePosition.row === targetPosition.row) {
      return this.grid[sourcePosition.row][(sourcePosition.col + targetPosition.col) / 2];
    }
    if (sourcePosition.col === targetPosition.col) {
      return this.grid[(sourcePosition.row + targetPosition.row) / 2][sourcePosition.col];
    }
    throw new Error();
  }
}
