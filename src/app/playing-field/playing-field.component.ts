import {Component, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {CellComponent} from './cell/cell.component';
import {Player} from '../player/player.model';
import {Cell} from '../cell/cell.model';
import {GameService} from '../game/game.service';
import {GridService} from '../grid/grid.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-playing-field',
  templateUrl: './playing-field.component.html',
  imports: [NgForOf, CellComponent, NgIf],
  styleUrls: ['./playing-field.component.css'],
  standalone: true,
})
export class PlayingFieldComponent implements OnInit {
  grid: Cell[][] = [];
  players: Player[] = [];

  constructor(
    private gameService: GameService,
    private gridService: GridService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.players = this.gameService.getPlayers();
    this.gameService.initializeGrid();
    this.grid = this.gameService.grid;
  }

  backgroundClass(i: number, j: number): string {
    const player = this.gameService.getStartingPlayer(i, j);
    return player?.color
      ? 'corner-' + player.color
      : 'ring-' + this.grid[i][j].distance;
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

  getPlayerScore(player: Player): number {
    return this.gameService.getPlayerScore(player.color);
  }

  getTemplateColumns(): string {
    return 'repeat(' + this.gridService.getGridSize() + ', 1fr)';
  }

  isUndoButtonDisabled() {
    return !this.gameService.canUndo();
  }

  onUndoClick() {
    this.gameService.undoLastMove();
    this.grid = this.gameService.grid;
    this.players = this.gameService.getPlayers();
  }

  async onHomeClick() {
    await this.router.navigate(['/']);
  }

  isRedoButtonDisabled(): boolean {
    return false;
  }

  onRedoClick(): void {
    /* void */
  }
}
