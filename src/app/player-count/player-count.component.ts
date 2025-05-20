import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../game/game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-player-count',
  imports: [FormsModule, CommonModule],
  templateUrl: './player-count.component.html',
  styleUrl: './player-count.component.css',
  standalone: true,
})
export class PlayerCountComponent {
  count: number = 2;

  constructor(private gameService: GameService, private router: Router) {}

  onClick() {
    this.gameService.initializePlayers(this.count);
    this.router.navigate(['game']);
  }

  isStartButtonDisabled() {
    return this.count > 4 || this.count < 2;
  }
}
