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
  grid: Cell[][] = [];
  players: Player[] = [];

  constructor(
    private gameService: GameService,
  ) {}

  ngOnInit(): void {
    this.players = this.gameService.getPlayers()
    this.gameService.initializeGrid()
    this.grid = this.gameService.grid;
  }

  backgroundColor(i: number, j: number): string {
    const player = this.gameService.getStartingPlayer(i, j);
    console.log(i, j, player)
    return player?.color ?? '#fff';
  }

  onCellClick(row: number, col: number): void {
    console.log(`Cell clicked: Row ${row}, Column ${col}`);
    // Implement your click logic here

    // Example: toggle a value
    this.grid[row][col].selected = !this.grid[row][col].selected;
  }

  getPsCounterClass(player: Player): string {
    const nextPlayer = this.gameService.getNextPlayer();
    if(player.color === nextPlayer?.color) {
      return 'ps-counter-active'
    }
    return 'ps-counter'
  }
}
