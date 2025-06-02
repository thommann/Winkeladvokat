// src/app/game/history/gameHistory.ts
import { Game } from '../game.model';
import { Position } from '../position.model';

export class GameHistory {

  private undoStack: Game[] = [];
  private redoStack: Game[] = [];
  private currentState?: Game = undefined;

  canUndo() {
    return this.undoStack.length > 0;
  }

  undo() {
    if (!this.canUndo()) {
      return;
    }

    const lastState = this.undoStack.pop();
    this.redoStack.push(this.cloneGame(this.currentState!));
    this.currentState = lastState;
    return this.cloneGame(lastState!);
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  redo() {
    if (!this.canRedo()) {
      return;
    }

    const nextState = this.redoStack.pop();
    this.undoStack.push(this.cloneGame(this.currentState!));
    this.currentState = nextState;
    return this.cloneGame(nextState!);
  }

  saveHistory(game: Game) {
    if (this.currentState) {
      this.undoStack.push(this.currentState);
    }
    this.currentState = this.cloneGame(game);
    this.redoStack = [];
  }

  resetHistory() {
    this.undoStack = [];
    this.redoStack = [];
    this.currentState = undefined;
  }

  private cloneGame(game: Game): Game {
    // Deep clone using JSON, then restore Position objects
    const cloned = JSON.parse(JSON.stringify(game)) as Game;

    // Restore Position objects
    if (cloned.selectedCell) {
      cloned.selectedCell = new Position(cloned.selectedCell.row, cloned.selectedCell.col);
    }
    if (cloned.winkelSource) {
      cloned.winkelSource = new Position(cloned.winkelSource.row, cloned.winkelSource.col);
    }

    return cloned;
  }
}
