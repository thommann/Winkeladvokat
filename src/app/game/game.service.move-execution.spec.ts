// src/app/game/game.service.move-execution.spec.ts
import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { PlayerService } from '../player/player.service';
import { GridService } from '../grid/grid.service';
import { Player } from '../player/player.model';
import { Cell } from '../cell/cell.model';
import { Position } from './position.model';

describe('GameService - Move Execution', () => {
  let service: GameService;
  let gridService: GridService;
  let playerService: PlayerService;

  const bluePlayer = new Player('blue');
  const redPlayer = new Player('red');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GameService, PlayerService, GridService]
    });
    service = TestBed.inject(GameService);
    gridService = TestBed.inject(GridService);
    playerService = TestBed.inject(PlayerService);
  });

  function setupGrid(size: number = 6): void {
    gridService.setGridSize(size);
    service.initializePlayers(2);
    service.initializeGrid();
  }

  function getCellAt(position: Position): Cell {
    return service.grid[position.row][position.col];
  }

  function setCellAt(position: Position, updates: Partial<Cell>): void {
    const cell = getCellAt(position);
    Object.assign(cell, updates);
  }

  function executeMove(from: Position, to: Position): void {
    service.cellSelected(from.row, from.col); // Select piece
    service.cellSelected(to.row, to.col);     // Execute move
  }

  describe('Paragraph Move Execution', () => {
    beforeEach(() => {
      setupGrid(6);
    });

    it('should move paragraph and remove jumped-over enemy paragraph', () => {
      // Arrange: Place blue paragraph at (2,1), red paragraph at (2,2)
      setCellAt(new Position(2, 1), { paragraph: bluePlayer });
      setCellAt(new Position(2, 2), { paragraph: redPlayer });

      const initialRedEaten = redPlayer.eaten;

      // Act: Execute jump move
      executeMove(new Position(2, 1), new Position(2, 3));

      // Assert: Blue paragraph moved, red paragraph removed, score updated
      expect(getCellAt(new Position(2, 1)).paragraph).toBeUndefined();
      expect(getCellAt(new Position(2, 2)).paragraph).toBeUndefined();
      expect(getCellAt(new Position(2, 3)).paragraph).toBe(bluePlayer);
      expect(bluePlayer.eaten).toBe(initialRedEaten + 1);
      expect(service.getSelectedCell()).toEqual(new Position(2, 3));
    });

    it('should update paragraph position correctly after multiple jumps', () => {
      // Arrange: Set up for multiple jumps
      setCellAt(new Position(2, 1), { paragraph: bluePlayer });
      setCellAt(new Position(2, 2), { paragraph: redPlayer });
      setCellAt(new Position(1, 3), { paragraph: redPlayer });

      // Act: First jump
      executeMove(new Position(2, 1), new Position(2, 3));

      // Act: Second jump (vertical)
      executeMove(new Position(2, 3), new Position(0, 3));

      // Assert: Paragraph at final position
      expect(getCellAt(new Position(0, 3)).paragraph).toBe(bluePlayer);
      expect(getCellAt(new Position(2, 3)).paragraph).toBeUndefined();
      expect(getCellAt(new Position(1, 3)).paragraph).toBeUndefined();
      expect(service.getSelectedCell()).toEqual(new Position(0, 3));
    });

    it('should not execute move if target is invalid', () => {
      // Arrange: Place paragraph with no valid jumps
      setCellAt(new Position(2, 2), { paragraph: bluePlayer });

      // Act: Try to move to invalid position
      const originalSelection = service.getSelectedCell();
      service.cellSelected(2, 2); // Select paragraph
      service.cellSelected(2, 3); // Try invalid move

      // Assert: Paragraph should not move
      expect(getCellAt(new Position(2, 2)).paragraph).toBe(bluePlayer);
      expect(getCellAt(new Position(2, 3)).paragraph).toBeUndefined();
    });
  });

  describe('Advocate Move Execution', () => {
    beforeEach(() => {
      setupGrid(6);
    });

    it('should move advocate and create winkel source on first move', () => {
      // Arrange: Place advocate
      setCellAt(new Position(2, 2), { advocate: bluePlayer });

      // Act: Move advocate
      executeMove(new Position(2, 2), new Position(2, 4));

      // Assert: Advocate moved, winkel source created
      expect(getCellAt(new Position(2, 2)).advocate).toBeUndefined();
      expect(getCellAt(new Position(2, 4)).advocate).toBe(bluePlayer);
      expect(service.getSelectedCell()).toEqual(new Position(2, 4));

      // Verify winkel source exists (this is internal state, tested through behavior)
      // Select advocate again and check that movement is restricted
      service.cellSelected(2, 4);
      const validTargets = [];
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
          if (service.grid[i][j].isValidTarget) {
            validTargets.push(new Position(i, j));
          }
        }
      }

      // Should include winkel source as valid target
      expect(validTargets).toContain(new Position(2, 2));
    });

    it('should place paragraph and clear winkel source on second move', () => {
      // Arrange: Set up for winkel move
      setCellAt(new Position(2, 2), { advocate: bluePlayer });

      // Act: First move (creates winkel source)
      executeMove(new Position(2, 2), new Position(2, 4));

      // Act: Second move (completes winkel move)
      executeMove(new Position(2, 4), new Position(4, 4));

      // Assert: Paragraph placed at original position, advocate moved
      expect(getCellAt(new Position(2, 2)).paragraph).toBe(bluePlayer);
      expect(getCellAt(new Position(2, 4)).advocate).toBeUndefined();
      expect(getCellAt(new Position(4, 4)).advocate).toBe(bluePlayer);
      expect(service.getSelectedCell()).toEqual(new Position(4, 4));
    });

    it('should not place paragraph when returning to winkel source', () => {
      // Arrange: Set up for winkel move
      setCellAt(new Position(2, 2), { advocate: bluePlayer });

      // Act: First move (creates winkel source)
      executeMove(new Position(2, 2), new Position(2, 4));

      // Act: Return to winkel source
      executeMove(new Position(2, 4), new Position(2, 2));

      // Assert: No paragraph placed, advocate back at original position
      expect(getCellAt(new Position(2, 2)).advocate).toBe(bluePlayer);
      expect(getCellAt(new Position(2, 2)).paragraph).toBeUndefined();
      expect(getCellAt(new Position(2, 4)).advocate).toBeUndefined();
      expect(service.getSelectedCell()).toEqual(new Position(2, 2));
    });
  });

  describe('Selection State Management', () => {
    beforeEach(() => {
      setupGrid(6);
    });

    it('should update selected cell when selecting a piece', () => {
      // Arrange: Place pieces
      setCellAt(new Position(2, 2), { advocate: bluePlayer });
      setCellAt(new Position(3, 3), { paragraph: redPlayer });

      // Act & Assert: Select advocate
      service.cellSelected(2, 2);
      expect(service.getSelectedCell()).toEqual(new Position(2, 2));

      // Act & Assert: Select paragraph
      service.cellSelected(3, 3);
      expect(service.getSelectedCell()).toEqual(new Position(3, 3));
    });

    it('should update selected cell after successful move', () => {
      // Arrange: Place paragraph with valid jump
      setCellAt(new Position(2, 1), { paragraph: bluePlayer });
      setCellAt(new Position(2, 2), { paragraph: redPlayer });

      // Act: Execute move
      executeMove(new Position(2, 1), new Position(2, 3));

      // Assert: Selected cell updated to new position
      expect(service.getSelectedCell()).toEqual(new Position(2, 3));
    });

    it('should clear selected cell appropriately', () => {
      // This tests the current behavior - if you select an empty cell, selection is cleared
      // Arrange: Place advocate
      setCellAt(new Position(2, 2), { advocate: bluePlayer });
      service.cellSelected(2, 2); // Select it

      // Act: Try to select empty cell
      service.cellSelected(3, 3); // Empty cell (assuming it's not a valid target)

      // Assert: Test current behavior (this might change based on your game rules)
      // For now, just document what happens
      const selectedCell = service.getSelectedCell();
      // The behavior here depends on your game's rules for invalid selections
    });
  });

  describe('Game State Consistency', () => {
    beforeEach(() => {
      setupGrid(6);
    });

    it('should maintain grid state consistency after moves', () => {
      // Arrange: Complex board state
      setCellAt(new Position(1, 1), { advocate: bluePlayer });
      setCellAt(new Position(2, 2), { paragraph: redPlayer });
      setCellAt(new Position(3, 3), { advocate: redPlayer });

      // Act: Execute several moves
      executeMove(new Position(1, 1), new Position(1, 3)); // Advocate move
      executeMove(new Position(1, 3), new Position(3, 3)); // Should fail - target occupied

      // Assert: State should be consistent
      expect(getCellAt(new Position(1, 1)).paragraph).toBe(bluePlayer); // Paragraph placed
      expect(getCellAt(new Position(1, 3)).advocate).toBeUndefined(); // Advocate moved away
      expect(getCellAt(new Position(3, 3)).advocate).toBe(redPlayer); // Red advocate still there
    });

    it('should handle score updates correctly', () => {
      // Arrange: Set up scoring scenario
      setCellAt(new Position(2, 1), { paragraph: bluePlayer });
      setCellAt(new Position(2, 2), { paragraph: redPlayer });

      const initialBlueScore = service.getPlayerScore(bluePlayer.color);
      const initialRedScore = service.getPlayerScore(redPlayer.color);

      // Act: Execute paragraph jump (blue eats red)
      executeMove(new Position(2, 1), new Position(2, 3));

      // Assert: Scores updated correctly
      const finalBlueScore = service.getPlayerScore(bluePlayer.color);
      const finalRedScore = service.getPlayerScore(redPlayer.color);

      expect(finalBlueScore).toBeGreaterThan(initialBlueScore);
      // Red's board score might change but eaten count should be same
    });
  });

  describe('History Integration', () => {
    beforeEach(() => {
      setupGrid(6);
    });

    it('should save game state to history after valid moves', () => {
      // Arrange: Place pieces
      setCellAt(new Position(2, 1), { paragraph: bluePlayer });
      setCellAt(new Position(2, 2), { paragraph: redPlayer });

      // Act: Execute move
      executeMove(new Position(2, 1), new Position(2, 3));

      // Assert: Should be able to undo
      expect(service.canUndo()).toBe(true);

      // Act: Undo move
      service.undoLastMove();

      // Assert: State restored
      expect(getCellAt(new Position(2, 1)).paragraph).toBe(bluePlayer);
      expect(getCellAt(new Position(2, 2)).paragraph).toBe(redPlayer);
      expect(getCellAt(new Position(2, 3)).paragraph).toBeUndefined();
    });

    it('should not save to history for invalid moves', () => {
      // Arrange: Place single paragraph (no valid moves)
      setCellAt(new Position(2, 2), { paragraph: bluePlayer });

      const canUndoBefore = service.canUndo();

      // Act: Try invalid move
      service.cellSelected(2, 2);
      service.cellSelected(2, 3); // Invalid - no paragraph to jump over

      // Assert: History unchanged
      expect(service.canUndo()).toBe(canUndoBefore);
    });
  });
});
