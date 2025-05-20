import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../player/player.service';
import { FormsModule } from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-player-count',
  imports: [FormsModule],
  templateUrl: './player-count.component.html',
  styleUrl: './player-count.component.css',
  standalone: true,
})
export class PlayerCountComponent{

  count: number = 2;

  constructor(private playerService: PlayerService, private router: Router ) {
  }

  onClick() {
    this.playerService.initializePlayers(this.count);
    this.router.navigate(['game']);
  }

  isStartButtonDisabled() {
    if (this.count > 4 || this.count < 2) {
      return true;
    }
    return false;
  }
}
