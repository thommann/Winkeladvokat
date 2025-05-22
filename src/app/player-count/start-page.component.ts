import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {Router} from '@angular/router';
import {GameService} from '../game/game.service';
import {NgOptimizedImage} from '@angular/common';
import {GridService} from '../grid/grid.service';

@Component({
  selector: 'app-player-count',
  imports: [FormsModule, NgOptimizedImage],
  templateUrl: './start-page.component.html',
  styleUrl: './start-page.component.css',
  standalone: true,
})
export class StartPageComponent {

  playerCount: number = 2;
  turboBlockchainEnabled: boolean = false;

  constructor(
    private gameService: GameService,
    private gridService: GridService,
    private router: Router,
  ) {
  }

  onStartGameClick() {
    this.gameService.initializePlayers(this.playerCount);
    this.gridService.setGridSize(this.turboBlockchainEnabled ? 6 : 8)
    this.router.navigate(['game']);
  }

  onPlayerCountClick(count: number) {
    this.playerCount = count;
  }

  onTurboBlockchainToggle() {
    this.turboBlockchainEnabled = !this.turboBlockchainEnabled
  }

}
