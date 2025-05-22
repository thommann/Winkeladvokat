import {Game} from '../game.model';

export class GameHistory {

    private undoStack: Game[] = [];
    private currentState?: Game = undefined;

    canUndo(){
      return this.undoStack.length > 0;
    }

    undo(){
      if(!this.canUndo()){
        return;
      }

      const lastState = this.undoStack.pop();
      this.currentState = lastState;
      return JSON.parse(JSON.stringify(lastState));
    }

    saveHistory(game: Game){
      if(this.currentState){
        this.undoStack.push(this.currentState);
      }
      this.currentState = JSON.parse(JSON.stringify(game));
    }

    resetHistory(){
      this.undoStack = [];
      this.currentState = undefined;
    }
}
