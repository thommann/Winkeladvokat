import { Player } from '../player/player.model';

export interface GameState {
  playerCount: number;
  players: Player[];
  turnIndex: number;
}

export const initialGameState: GameState = {
  playerCount: 0,
  players: [],
  turnIndex: 0
};
