import { Component, OnInit } from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {CellComponent} from './cell/cell.component';
import {Player} from '../player.model';
import {PlayerService} from '../player.service';
import {CellState} from '../cell-state/CellState';

@Component({
  selector: 'app-playing-field',
  templateUrl: './playing-field.component.html',
  imports: [
    NgForOf,
    CellComponent,
    NgIf
  ],
  styleUrls: ['./playing-field.component.css'],
  standalone: true
})
export class PlayingFieldComponent implements OnInit {
  grid: any[][] = [];
  readonly GRID_SIZE = 8;
  players: Player[] = [];

  constructor(private playerService: PlayerService) { }

  ngOnInit(): void {
    // Set number of players (can be adjusted as needed)
    this.playerService.initializePlayers(4); // Using 4 players for all corners
    this.players = this.playerService.players;

    // Initialize the grid
    this.initializeGrid();
  }

  initializeGrid(): void {
    this.grid = [];
    for (let i = 0; i < this.GRID_SIZE; i++) {
      const row = [];
      for (let j = 0; j < this.GRID_SIZE; j++) {
        row.push({
          selected: false,
          value: Math.ceil(Math.random() * 5),
          advocate: this.getStartingPlayer(i,j),
          backgroundColor: this.backgroundColor(i, j)
        } satisfies CellState);
      }
      this.grid.push(row);
    }
  }

  getStartingPlayer(i: number, j: number): Player | undefined {
    if (i == 0 && j == 0) {
      return this.players[0]
    }
    if(i == 0 && j == this.GRID_SIZE - 1) {
      return this.players[1]
    }
    if(i == this.GRID_SIZE -1 && j == this.GRID_SIZE -1) {
      return this.players.at(2)
    }
    if (i == this.GRID_SIZE -1 && j == 0) {
      return this.players.at(3)
    }
    return undefined
  }

  backgroundColor(i: number, j: number): string {
    return this.getStartingPlayer(i, j)?.color ?? "#fff"
  }

  onCellClick(row: number, col: number): void {
    console.log(`Cell clicked: Row ${row}, Column ${col}`);
    // Implement your click logic here

    // Example: toggle a value
    this.grid[row][col].selected = !this.grid[row][col].selected;
  }
}
