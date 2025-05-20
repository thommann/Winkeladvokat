import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap } from 'rxjs/operators';
import * as GameActions from './game-actions';
import { PlayerService } from '../player/player.service';

@Injectable()
export class GameEffects {
  private actions$ = inject(Actions);
  private playerService = inject(PlayerService);

  initializePlayers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameActions.initializePlayers),
      switchMap(({ count }) => {
        const players = this.playerService.createPlayers(count);
        return [
          GameActions.setPlayerCount({ count }),
          GameActions.playersInitialized({ players }),
          GameActions.setTurnIndex({ index: Math.floor(Math.random() * count) })
        ];
      })
    )
  );
}
