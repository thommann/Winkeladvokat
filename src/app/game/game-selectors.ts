import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GameState } from './game-state';

export const selectGameState = createFeatureSelector<GameState>('game');

export const selectPlayerCount = createSelector(
  selectGameState,
  (state: GameState) => state.playerCount
);

export const selectPlayers = createSelector(
  selectGameState,
  (state: GameState) => state.players
);

export const selectTurnIndex = createSelector(
  selectGameState,
  (state: GameState) => state.turnIndex
);

export const selectCurrentPlayer = createSelector(
  selectGameState,
  (state: GameState) => state.players[state.turnIndex]
);
