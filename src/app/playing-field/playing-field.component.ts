import { Component, OnInit } from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {CellComponent} from './cell/cell.component';
import {PlayerService} from '../PlayerService';
import {Player} from '../Player';

@Component({
  selector: 'app-playing-field',
  templateUrl: './playing-field.component.html',
  imports: [
    NgForOf,
    CellComponent,
    NgIf
  ],
  styleUrls: ['./playing-field.component.css']
})
export class PlayingFieldComponent implements OnInit {
  grid: any[][] = [];
  readonly GRID_SIZE = 8;
  players: Player[] = [];

  constructor(private playerService: PlayerService) { }

  ngOnInit(): void {
    // Initialize the grid
    this.initializeGrid();

    // Set number of players (can be adjusted as needed)
    this.playerService.initializePlayers(4); // Using 4 players for all corners
    this.players = this.playerService.players;
  }

  initializeGrid(): void {
    this.grid = [];
    for (let i = 0; i < this.GRID_SIZE; i++) {
      const row = [];
      for (let j = 0; j < this.GRID_SIZE; j++) {
        row.push({
          selected: false,
          value: Math.ceil(Math.random() * 5)
          // Add any other properties you need for your cells
        });
      }
      this.grid.push(row);
    }
  }

  backgroundColor(i: number, j: number): string {
    if (i == 0 && j == 0) {
      return "blue"
    }
    if(i == 0 && j == this.GRID_SIZE - 1) {
      return "red"
    }
    if (i == this.GRID_SIZE -1 && j == 0) {
      return "green"
    }
    if(i == this.GRID_SIZE -1 && j == this.GRID_SIZE -1) {
      return "yellow"
    }
    return "#fff"
  }

  getPlayerByColor(color: string): Player | undefined {
    return this.players.find(player => player.color === color);
  }

  onCellClick(row: number, col: number): void {
    console.log(`Cell clicked: Row ${row}, Column ${col}`);
    // Implement your click logic here

    // Example: toggle a value
    this.grid[row][col].selected = !this.grid[row][col].selected;
  }
}
