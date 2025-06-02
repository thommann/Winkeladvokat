// src/app/player-count/start-page.component.ts (partial update)
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../game/game.service';
import {NgForOf, NgOptimizedImage} from '@angular/common';
import { GridService } from '../grid/grid.service';
import { GAME_CONFIG, GameConfigHelper } from '../game/game.config';

@Component({
  selector: 'app-player-count',
  imports: [FormsModule, NgOptimizedImage, NgForOf],
  templateUrl: './start-page.component.html',
  styleUrl: './start-page.component.css',
  standalone: true,
})
export class StartPageComponent implements OnInit {
  playerCount: number = GAME_CONFIG.PLAYERS.MIN_COUNT; // Use config instead of hardcoded 2
  turboBlockchainEnabled: boolean = false;

  // Expose config to template
  readonly MIN_PLAYERS = GAME_CONFIG.PLAYERS.MIN_COUNT;
  readonly MAX_PLAYERS = GAME_CONFIG.PLAYERS.MAX_COUNT;
  readonly NORMAL_GRID_SIZE = GAME_CONFIG.GRID.NORMAL_SIZE;
  readonly TURBO_GRID_SIZE = GAME_CONFIG.GRID.TURBO_BLOCKCHAIN_SIZE;

  constructor(
    private gameService: GameService,
    private gridService: GridService,
    private router: Router,
  ) {}

  ngOnInit() {
    const currentPlayerCount = this.gameService.getPlayers().length;
    this.playerCount = currentPlayerCount > 0 ? currentPlayerCount : GAME_CONFIG.PLAYERS.MIN_COUNT;
    this.turboBlockchainEnabled = this.gridService.getGridSize() === GAME_CONFIG.GRID.TURBO_BLOCKCHAIN_SIZE;
  }

  onStartGameClick() {
    this.gameService.initializePlayers(this.playerCount);
    const gridSize = this.turboBlockchainEnabled
      ? GAME_CONFIG.GRID.TURBO_BLOCKCHAIN_SIZE
      : GAME_CONFIG.GRID.NORMAL_SIZE;
    this.gridService.setGridSize(gridSize);
    this.router.navigate(['game']);
  }

  onPlayerCountClick(count: number) {
    if (GameConfigHelper.isValidPlayerCount(count)) {
      this.playerCount = count;
    }
  }

  onTurboBlockchainToggle() {
    this.turboBlockchainEnabled = !this.turboBlockchainEnabled;
  }

  getGridSizeLabel(): string {
    const size = this.turboBlockchainEnabled
      ? GAME_CONFIG.GRID.TURBO_BLOCKCHAIN_SIZE
      : GAME_CONFIG.GRID.NORMAL_SIZE;
    return GameConfigHelper.getGridSizeLabel(size);
  }

  // Helper methods for template
  getPlayerCountOptions(): number[] {
    return Array.from(
      { length: GAME_CONFIG.PLAYERS.MAX_COUNT - GAME_CONFIG.PLAYERS.MIN_COUNT + 1 },
      (_, i) => i + GAME_CONFIG.PLAYERS.MIN_COUNT
    );
  }
}
