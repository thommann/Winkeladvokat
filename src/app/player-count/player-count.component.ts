import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../player/player.service';
import { FormsModule } from '@angular/forms';
import {GameService} from '../game/game.service';

@Component({
  selector: 'app-player-count',
  imports: [FormsModule],
  templateUrl: './player-count.component.html',
  styleUrl: './player-count.component.css',
  standalone: true,
})
export class PlayerCountComponent implements OnInit {
  count: number = 0;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.count = this.gameService.getPlayerCount();
  }

  setPlayerCount($event: Event) {
    const input = $event.target as HTMLInputElement;
    const value = parseInt(input.value);
    this.count = value;
    this.gameService.initializePlayers(value);
  }
}
