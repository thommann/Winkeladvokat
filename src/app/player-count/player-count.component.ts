import {Component, OnInit} from '@angular/core';
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
export class PlayerCountComponent implements OnInit {

  count: number = 0;

  constructor(private playerService: PlayerService) {
  }

  ngOnInit(): void {
    this.count = this.playerService.players.length;
  }

  setPlayerCount($event: Event) {
    const input =  $event.target as HTMLInputElement;
    const value = parseInt(input.value);
    this.count = value;
    this.playerService.initializePlayers(value);
  }
}
