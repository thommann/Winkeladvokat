import { Component } from '@angular/core';
import { PlayingFieldComponent } from './playing-field/playing-field.component';
import {StartPageComponent} from './player-count/start-page.component';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    RouterOutlet
  ],
  styleUrls: ['./app.component.css'],
  standalone: true
})
export class AppComponent {
  title = 'playing-field-app';
}
