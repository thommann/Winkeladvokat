import {Injectable} from '@angular/core';
import {Game} from '../game.model';

@Injectable({
  providedIn: 'root',
})
export class GameHistoryService {

    private undoStack: Game[] = [];

    canUndo(){
      return this.undoStack.length > 0;
    }

    undo(){
      return this.undoStack.pop();
    }

    saveHistory(game: Game){
      const gameCopy = JSON.parse(JSON.stringify(game));
      console.log(gameCopy);
      this.undoStack.push(gameCopy);
    }
}
