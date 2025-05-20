import { Component, OnInit } from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import { CellComponent } from './cell/cell.component';
import { Player } from '../player/player.model';
import { PlayerService } from '../player/player.service';
import { Cell } from '../cell/cell.model';
import {GridService} from '../grid/grid.service';
import {GameService} from '../game/game.service';

@Component({
  selector: 'app-playing-field',
  templateUrl: './playing-field.component.html',
  imports: [
    NgForOf,
    CellComponent,
    NgIf,
    NgClass
  ],
  styleUrls: ['./playing-field.component.css'],
  standalone: true
})
export class PlayingFieldComponent implements OnInit {
  grid: any[][] = [];
  players: Player[] = [];

  constructor(
    private playerService: PlayerService,
    private gridService: GridService,
    private gameService: GameService,
  ) {}

  ngOnInit(): void {
    // Set number of players (can be adjusted as needed)
    this.gameService.initializePlayers(4); // Using 4 players for all corners
    this.players = this.gameService.getPlayers()
    // Initialize the grid
    this.initializeGrid();
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

        if (!isCorner) {
          const ring = Math.min(i, j, gridSize - 1 - i, gridSize - 1 - j);
          points = Math.pow(2, ring + 1);
        }

        row.push({
          selected: false,
          value: points,
          advocate: this.gameService.getStartingPlayer(i, j),
          backgroundColor: this.backgroundColor(i, j),
        } satisfies Cell);
      }
      this.grid.push(row);
    }
  }

  backgroundColor(i: number, j: number): string {
    const player = this.gameService.getStartingPlayer(i, j);
    return player?.color ?? '#fff';
  }

  onCellClick(row: number, col: number): void {
    console.log(`Cell clicked: Row ${row}, Column ${col}`);
    // Implement your click logic here

    // Example: toggle a value
    this.grid[row][col].selected = !this.grid[row][col].selected;
  }

  getPsCounterClass(player: Player): string {
    const nextPlayer = this.gameService.getCurrentPlayer();
    if(player.color === nextPlayer?.color) {
      return 'ps-counter-active'
    }
    return 'ps-counter'
  }
}
