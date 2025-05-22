import {Injectable} from '@angular/core';
import {Player} from '../player/player.model';
import {Game} from './game.model';
import {PlayerService} from '../player/player.service';
import {GridService} from '../grid/grid.service';
import {Cell} from '../cell/cell.model';
import {GameHistory} from './history/gameHistory';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private game: Game;
  private gameHistoryService: GameHistory;
  public get grid(){
    return this.game.grid;
  }

  constructor(
    private playerService: PlayerService,
    private gridService: GridService,
    // private gameHistoryService: GameHistoryService
  ) {
    this.game = new Game();
    this.gameHistoryService = new GameHistory();
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
    this.gameHistoryService.resetHistory()
    this.gameHistoryService.saveHistory(this.game);
  }

  cellSelected(targetRow: number, targetColumn: number): void {
    let targetCell = this.grid[targetRow][targetColumn];


    if(!targetCell.isValidTarget) {
      return;
    }

    if (targetCell.advocate || targetCell.paragraph) {
      this.game.selectedCell = [targetRow, targetColumn];
      this.validateCells();
      return;
    }

    if (this.game.selectedCell) {
      const sourceCellCoordinates = this.game.selectedCell;
      const sourceCellRow = sourceCellCoordinates[0];
      const sourceCellColumn = sourceCellCoordinates[1];
      const sourceCell = this.grid[sourceCellRow][sourceCellColumn];

      if (sourceCell.paragraph) {
        targetCell = this.moveParagraph(targetRow, targetColumn, sourceCell);
        const cellInBetween = this.getCellInBetween(
          sourceCellRow,
          sourceCellColumn,
          targetRow,
          targetColumn
        );
        cellInBetween.paragraph = undefined;
        targetCell.paragraph!.eaten++;
        this.validateCells()
        this.gameHistoryService.saveHistory(this.game);
        return;
      }

      if (sourceCell.advocate) {
        this.moveAdvocate(targetRow, targetColumn, sourceCellRow, sourceCellColumn);
        this.validateCells();
        this.gameHistoryService.saveHistory(this.game);
        return;
      }
    }
  }

  canUndo(){
    return this.gameHistoryService.canUndo();
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
    selectedRow: number,
    selectedColumn: number,
    selectedParagraph: Player,
  ) {
    const validCells = this.getValidCellsForParagraphAt(selectedRow, selectedColumn, selectedParagraph);
    validCells.forEach(([row, col]) => {
      this.grid[row][col].isValidTarget = true;
      this.grid[row][col].validTargetColor = selectedParagraph.color;
    });
  }

  private getValidCellsForParagraphAt(
    selectedRow: number,
    selectedColumn: number,
    selectedParagraph: Player,
  ) {
    let validCells: number[][] = []
    if(this.isValidCellForParagraphInDirection(selectedRow, selectedColumn, selectedParagraph, -2, 0)){
      validCells.push([selectedRow - 2, selectedColumn])
    }
    if(this.isValidCellForParagraphInDirection(selectedRow, selectedColumn, selectedParagraph, 2, 0)){
      validCells.push([selectedRow + 2, selectedColumn])
    }
    if(this.isValidCellForParagraphInDirection(selectedRow, selectedColumn, selectedParagraph, 0, -2)){
      validCells.push([selectedRow, selectedColumn - 2])
    }
    if(this.isValidCellForParagraphInDirection(selectedRow, selectedColumn, selectedParagraph, 0, 2)){
      validCells.push([selectedRow, selectedColumn + 2])
    }
    return validCells;
  }

  private isValidCellForParagraphInDirection(
    selectedRow: number,
    selectedColumn: number,
    selectedParagraph: Player,
    rowDiff: number,
    columnDiff: number
  ): boolean {
    const targetRow = selectedRow + rowDiff;
    const targetColumn = selectedColumn + columnDiff;
    const gridSize = this.gridService.getGridSize();
    if(targetRow >= 0 && targetRow < gridSize && targetColumn >= 0 && targetColumn < gridSize) {
      const targetCell = this.grid[targetRow][targetColumn];
      if(targetCell.paragraph || targetCell.advocate) {
        return false;
      }
      const cellInBetween = this.getCellInBetween(selectedRow, selectedColumn, targetRow, targetColumn);
      if (cellInBetween.paragraph) {
        if (cellInBetween.paragraph.color !== selectedParagraph.color) {
          return true
        }
      }
    }
    return false;
  }

  private validateAdvocateAt(
    selectedRow: number,
    selectedColumn: number,
    rowDirection: number,
    columnDirection: number,
  ) {
    const gridSize = this.gridService.getGridSize();
    const selectedCell = this.grid[selectedRow][selectedColumn];
    let done = false;
    for (let row = selectedRow + rowDirection; row < gridSize && row >= 0; row += rowDirection) {
      for (let column = selectedColumn + columnDirection; column < gridSize && column >= 0; column += columnDirection) {
        const targetCell = this.grid[row][column];
        if (targetCell.paragraph || targetCell.advocate) {
          done = true;
          break
        }
        targetCell.isValidTarget = true;
        targetCell.validTargetColor = selectedCell.advocate?.color ?? "";
        if(columnDirection === 0) {
          break
        }
      }
      if(rowDirection === 0 || done) {
        break;
      }
    }
  }

  private validateCellsWithStones() {
    const gridSize = this.gridService.getGridSize();
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const cell = this.grid[i][j];
        if(cell.advocate) {
          cell.isValidTarget = true;
        }
        else if(cell.paragraph){
          if(this.getValidCellsForParagraphAt(i, j, cell.paragraph).length > 0) {
            cell.isValidTarget = true;
          }
        }
      }
    }
  }

  private validateCells() {
    if(this.game.selectedCell === undefined) {
      return;
    }
    const selectedRow = this.game.selectedCell[0];
    const selectedColumn = this.game.selectedCell[1];
    const selectedCell = this.grid[selectedRow][selectedColumn];
    if(selectedCell.paragraph) {
      this.invalidateAllCells();
      this.validateCellsWithStones();
      const selectedParagraph = selectedCell.paragraph;
      this.validateCellsForParagraphAt(selectedRow, selectedColumn, selectedParagraph);
    }
    if(selectedCell.advocate) {
      this.invalidateAllCells();
      if(this.game.winkelSource) {
        const winkelSourceCell = this.grid[this.game.winkelSource[0]][this.game.winkelSource[1]];
        winkelSourceCell.isValidTarget = true;
        winkelSourceCell.validTargetColor = selectedCell.advocate?.color ?? "";
        if(this.game.winkelSource[0] === selectedRow){
          this.validateAdvocateAt(selectedRow, selectedColumn, -1, 0)
          this.validateAdvocateAt(selectedRow, selectedColumn, 1, 0)
        }
        if(this.game.winkelSource[1] === selectedColumn){
          this.validateAdvocateAt(selectedRow, selectedColumn, 0, -1)
          this.validateAdvocateAt(selectedRow, selectedColumn, 0, 1)
        }
      }
      else{
        this.validateCellsWithStones();
        this.validateAdvocateAt(selectedRow, selectedColumn, -1, 0)
        this.validateAdvocateAt(selectedRow, selectedColumn, 0, -1)
        this.validateAdvocateAt(selectedRow, selectedColumn, 1, 0)
        this.validateAdvocateAt(selectedRow, selectedColumn, 0, 1)
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
    sourceRow: number,
    sourceColumn: number,
  ): void {
    const sourceCell = this.grid[sourceRow][sourceColumn];
    this.grid[targetRow][targetColumn].advocate = sourceCell.advocate;
    sourceCell.advocate = undefined;
    this.game.selectedCell = [targetRow, targetColumn];
    if (this.game.winkelSource !== undefined) {
      if(!(this.game.winkelSource[0] === targetRow && this.game.winkelSource[1] === targetColumn)) {
        sourceCell.paragraph = this.grid[targetRow][targetColumn].advocate;
      }
      this.game.winkelSource = undefined;
    } else {
      this.game.winkelSource = [sourceRow, sourceColumn]
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

  undoLastMove() {
    if(this.gameHistoryService.canUndo()){
      console.log("gameService undoLastMove")
      this.game = this.gameHistoryService.undo()!;
    }
  }
}
