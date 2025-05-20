import { createAction, props } from '@ngrx/store';
import { Player } from '../player/player.model';

export const setPlayerCount = createAction(
  '[Game] Set Player Count',
  props<{ count: number }>()
);

export const initializePlayers = createAction(
  '[Game] Initialize Players',
  props<{ count: number }>()
);

export const playersInitialized = createAction(
  '[Game] Players Initialized',
  props<{ players: Player[] }>()
);

export const setTurnIndex = createAction(
  '[Game] Set Turn Index',
  props<{ index: number }>()
);

export const nextTurn = createAction(
  '[Game] Next Turn'
);
