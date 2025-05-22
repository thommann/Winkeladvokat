import {Game} from '../game.model';

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
    this.redoStack.push(JSON.parse(JSON.stringify(this.currentState)));
    this.currentState = lastState;
    return JSON.parse(JSON.stringify(lastState));
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  redo() {
    if (!this.canRedo()) {
      return;
    }

    const nextState = this.redoStack.pop();
    this.undoStack.push(JSON.parse(JSON.stringify(this.currentState)));
    this.currentState = nextState;
    return JSON.parse(JSON.stringify(nextState));
  }

  saveHistory(game: Game) {
    if (this.currentState) {
      this.undoStack.push(this.currentState);
    }
    this.currentState = JSON.parse(JSON.stringify(game));
    this.redoStack = [];
  }

    resetHistory(){
      this.undoStack = [];
      this.currentState = undefined;
    }
}
