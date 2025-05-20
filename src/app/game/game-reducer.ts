import { createReducer, on } from '@ngrx/store';
import { initialGameState } from './game-state';
import * as GameActions from './game-actions';

export const gameReducer = createReducer(
  initialGameState,

  on(GameActions.setPlayerCount, (state, { count }) => ({
    ...state,
    playerCount: count
  })),

  on(GameActions.playersInitialized, (state, { players }) => ({
    ...state,
    players
  })),

  on(GameActions.setTurnIndex, (state, { index }) => ({
    ...state,
    turnIndex: index
  })),

  on(GameActions.nextTurn, (state) => {
    let nextIndex = state.turnIndex + 1;
    if (nextIndex >= state.playerCount) {
      nextIndex = 0;
    }
    return {
      ...state,
      turnIndex: nextIndex
    };
  })
);
