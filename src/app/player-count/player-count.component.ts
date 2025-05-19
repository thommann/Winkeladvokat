import { Component } from '@angular/core';
import {PlayerService} from '../player.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-player-count',
  imports: [
    FormsModule
  ],
  templateUrl: './player-count.component.html',
  styleUrl: './player-count.component.css',
  standalone: true
})
export class PlayerCountComponent {

  set playerCount(value: number){
    this.playerService.initializePlayers(value);
    console.log(value)
  }

  constructor(private playerService: PlayerService) {
  }
}
