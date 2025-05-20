import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { routes } from './app.routes';
import { gameReducer } from './game/game.reducer';
import { GameEffects } from './game/game.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideStore({ game: gameReducer }),
    provideEffects([GameEffects])
  ]
};
