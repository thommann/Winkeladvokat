import { Component, OnInit } from '@angular/core';
import {NgForOf} from '@angular/common';
import {CellComponent} from './cell/cell.component';

@Component({
  selector: 'app-playing-field',
  templateUrl: './playing-field.component.html',
  imports: [
    NgForOf,
    CellComponent
  ],
  styleUrls: ['./playing-field.component.css']
})
export class PlayingFieldComponent implements OnInit {
  grid: any[][] = [];
  readonly GRID_SIZE = 8;

  constructor() { }

  ngOnInit(): void {
    this.initializeGrid();
  }

  initializeGrid(): void {
    this.grid = [];
    for (let i = 0; i < this.GRID_SIZE; i++) {
      const row = [];
      for (let j = 0; j < this.GRID_SIZE; j++) {
        row.push({
          value: 0,
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
    if ( i == this.GRID_SIZE -1 && j == 0) {
      return "green"
    }
    if(i == this.GRID_SIZE -1 && j == this.GRID_SIZE -1) {
      return "yellow"
    }
    return "#fff"
  }

  onCellClick(row: number, col: number): void {
    console.log(`Cell clicked: Row ${row}, Column ${col}`);
    // Implement your click logic here

    // Example: toggle a value
    this.grid[row][col].value = this.grid[row][col].value === 0 ? 1 : 0;
  }
}
