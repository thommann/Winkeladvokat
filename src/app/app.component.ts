import { Component } from '@angular/core';
import { PlayingFieldComponent } from './playing-field/playing-field.component';
import {PlayerCountComponent} from './player-count/player-count.component';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    PlayingFieldComponent, PlayerCountComponent, RouterOutlet
  ],
  styleUrls: ['./app.component.css'],
  standalone: true
})
export class AppComponent {
  title = 'playing-field-app';
}
