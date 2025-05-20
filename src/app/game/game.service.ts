import { Injectable, inject } from '@angular/core';
import { Player } from '../player/player.model';
import { Store } from '@ngrx/store';
import { GridService } from '../grid/grid.service';
import * as GameActions from './game.actions';
import * as GameSelectors from './game.selectors';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private store = inject(Store);
  private gridService = inject(GridService);

  // Create signals from the store selectors
  readonly players = toSignal(this.store.select(GameSelectors.selectPlayers), { initialValue: [] });
  readonly playerCount = toSignal(this.store.select(GameSelectors.selectPlayerCount), { initialValue: 0 });
  readonly turnIndex = toSignal(this.store.select(GameSelectors.selectTurnIndex), { initialValue: 0 });
  readonly currentPlayer = toSignal(this.store.select(GameSelectors.selectCurrentPlayer));

  getStartingPlayer(i: number, j: number): Player | undefined {
    const playerIndex = this.gridService.getPlayerIndexForCorner(i, j);
    return playerIndex !== undefined ? this.players()[playerIndex] : undefined;
  }

  initializePlayers(count: number): void {
    this.store.dispatch(GameActions.initializePlayers({ count }));
  }

  getPlayerCount(): number {
    return this.playerCount();
  }

  getPlayers(): Player[] {
    return this.players();
  }

  getNextPlayer(): Player {
    this.store.dispatch(GameActions.nextTurn());
    return this.currentPlayer() as Player;
  }
}
