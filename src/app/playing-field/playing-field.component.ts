import { Component, OnInit } from '@angular/core';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { CellComponent } from './cell/cell.component';
import { Player } from '../player/player.model';
import { Cell } from '../cell/cell.model';
import { GameService } from '../game/game.service';
import { GridService } from '../grid/grid.service';

@Component({
  selector: 'app-playing-field',
  templateUrl: './playing-field.component.html',
  imports: [NgForOf, CellComponent, NgIf, NgClass],
  styleUrls: ['./playing-field.component.css'],
  standalone: true,
})
export class PlayingFieldComponent implements OnInit {
  grid: Cell[][] = [];
  players: Player[] = [];

  constructor(
    private gameService: GameService,
    private gridService: GridService
  ) {}

  ngOnInit(): void {
    this.players = this.gameService.getPlayers();
    this.gameService.initializeGrid();
    this.grid = this.gameService.grid;
  }

  backgroundColor(i: number, j: number): string {
    const player = this.gameService.getStartingPlayer(i, j);
    return player?.color ?? '#fff';
  }

  isCellSelected(i: number, j: number): boolean {
    const selectedCell = this.gameService.getSelectedCell();
    return (
      selectedCell !== undefined &&
      selectedCell[0] === i &&
      selectedCell[1] === j
    );
  }

  onCellClick(row: number, col: number): void {
    this.gameService.cellSelected(row, col);
  }

  getPsCounterClass(player: Player): string {
    const currentPlayer = this.gameService.getCurrentPlayer();
    if (player.color === currentPlayer?.color) {
      return 'ps-counter-active';
    }
    return 'ps-counter';
  }

  getTemplateColumns(): string {
    return 'repeat(' + this.gridService.getGridSize() + ', 1fr)';
  }
}
