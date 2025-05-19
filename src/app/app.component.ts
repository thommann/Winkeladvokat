import { Component } from '@angular/core';
import { PlayingFieldComponent } from './playing-field/playing-field.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    PlayingFieldComponent
  ],
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'playing-field-app';
}
