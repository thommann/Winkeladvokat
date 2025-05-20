import { Component, OnInit } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { CellComponent } from './cell/cell.component';
import { Player } from '../player/player.model';
import { PlayerService } from '../player/player.service';
import { Cell } from '../cell/cell.model';
import {GridService} from '../grid/grid.service';
import {GameService} from '../game/game.service';

@Component({
  selector: 'app-playing-field',
  templateUrl: './playing-field.component.html',
  imports: [NgForOf, CellComponent, NgIf],
  styleUrls: ['./playing-field.component.css'],
  standalone: true,
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
        let points!: number;
        if (i === 0 && (j === 0 || j === gridSize - 1)) points = 0;
        else if (i === gridSize - 1 && (j === 0 || j === gridSize - 1)) points = 0;
        else {
          for (let n = 1; n < Math.ceil((gridSize - 1) / 2); n++) {
            if ((i == n || i == gridSize - n - 1) && (j == n || j == gridSize - n - 1)) {
              points = 2 ^ n
            }
          }
        }

        row.push({
          selected: false,
          value: Math.ceil(points),
          advocate: this.gameService.getStartingPlayer(i, j),
          backgroundColor: this.backgroundColor(i, j),
        } satisfies Cell);
      }
      this.grid.push(row);
    }
  }

  backgroundColor(i: number, j: number): string {
    return this.gameService.getStartingPlayer(i, j)?.color ?? '#fff';
  }

  onCellClick(row: number, col: number): void {
    console.log(`Cell clicked: Row ${row}, Column ${col}`);
    // Implement your click logic here

    // Example: toggle a value
    this.grid[row][col].selected = !this.grid[row][col].selected;
  }
}
