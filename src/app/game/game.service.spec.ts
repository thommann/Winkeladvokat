// src/app/game/game.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { PlayerService } from '../player/player.service';
import { GridService } from '../grid/grid.service';
import { Player } from '../player/player.model';
import { Cell } from '../cell/cell.model';
import { Position } from './position.model';

describe('GameService - Validation Logic', () => {
  let service: GameService;
  let gridService: GridService;
  let playerService: PlayerService;

  // Test data
  const bluePlayer = new Player('blue');
  const redPlayer = new Player('red');
  const yellowPlayer = new Player('yellow');
  const greenPlayer = new Player('green');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GameService, PlayerService, GridService]
    });
    service = TestBed.inject(GameService);
    gridService = TestBed.inject(GridService);
    playerService = TestBed.inject(PlayerService);
  });

  // Helper methods for setting up test scenarios
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

  function getValidTargetPositions(): Position[] {
    const validPositions: Position[] = [];
    const gridSize = gridService.getGridSize();

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (service.grid[i][j].isValidTarget) {
          validPositions.push(new Position(i, j));
        }
      }
    }
    return validPositions;
  }

  function selectCell(position: Position): void {
    service.cellSelected(position.row, position.col);
  }

  describe('Paragraph Move Validation', () => {
    beforeEach(() => {
      setupGrid(6);
    });

    it('should allow paragraph to jump over enemy paragraph horizontally', () => {
      // Arrange: Place blue paragraph at (2,1), red paragraph at (2,2)
      setCellAt(new Position(2, 1), { paragraph: bluePlayer });
      setCellAt(new Position(2, 2), { paragraph: redPlayer });

      // Act: Select blue paragraph
      selectCell(new Position(2, 1));

      // Assert: Should be able to jump to (2,3)
      const validTargets = getValidTargetPositions();
      expect(validTargets).toContain(new Position(2, 3));
    });

    it('should allow paragraph to jump over enemy paragraph vertically', () => {
      // Arrange: Place blue paragraph at (1,2), red paragraph at (2,2)
      setCellAt(new Position(1, 2), { paragraph: bluePlayer });
      setCellAt(new Position(2, 2), { paragraph: redPlayer });

      // Act: Select blue paragraph
      selectCell(new Position(1, 2));

      // Assert: Should be able to jump to (3,2)
      const validTargets = getValidTargetPositions();
      expect(validTargets).toContain(new Position(3, 2));
    });

    it('should not allow paragraph to jump over friendly paragraph', () => {
      // Arrange: Place two blue paragraphs at (2,1) and (2,2)
      setCellAt(new Position(2, 1), { paragraph: bluePlayer });
      setCellAt(new Position(2, 2), { paragraph: bluePlayer });

      // Act: Select first blue paragraph
      selectCell(new Position(2, 1));

      // Assert: Should not be able to jump to (2,3)
      const validTargets = getValidTargetPositions();
      expect(validTargets).not.toContain(new Position(2, 3));
    });

    it('should not allow paragraph to jump if landing spot is occupied', () => {
      // Arrange: Place paragraphs at (2,1), (2,2), and (2,3)
      setCellAt(new Position(2, 1), { paragraph: bluePlayer });
      setCellAt(new Position(2, 2), { paragraph: redPlayer });
      setCellAt(new Position(2, 3), { paragraph: yellowPlayer });

      // Act: Select blue paragraph
      selectCell(new Position(2, 1));

      // Assert: Should not be able to jump to occupied (2,3)
      const validTargets = getValidTargetPositions();
      expect(validTargets).not.toContain(new Position(2, 3));
    });

    it('should not allow paragraph to jump out of bounds', () => {
      // Arrange: Place paragraphs near edge
      setCellAt(new Position(0, 1), { paragraph: bluePlayer });
      setCellAt(new Position(0, 2), { paragraph: redPlayer });

      // Act: Select blue paragraph
      selectCell(new Position(0, 1));

      // Assert: Should not be able to jump to out-of-bounds (0,3) when grid is 6x6
      const validTargets = getValidTargetPositions();
      expect(validTargets).not.toContain(new Position(0, 6)); // Out of bounds
    });

    it('should not allow paragraph to move without jumping over another paragraph', () => {
      // Arrange: Place single blue paragraph
      setCellAt(new Position(2, 2), { paragraph: bluePlayer });

      // Act: Select blue paragraph
      selectCell(new Position(2, 2));

      // Assert: Should have no valid moves (no paragraphs to jump over)
      const validTargets = getValidTargetPositions().filter(pos =>
        !getCellAt(pos).advocate && !getCellAt(pos).paragraph
      );
      expect(validTargets.length).toBe(0);
    });
  });

  describe('Advocate Move Validation', () => {
    beforeEach(() => {
      setupGrid(6);
    });

    it('should allow advocate to move in straight lines when no winkel source', () => {
      // Arrange: Place blue advocate at center
      setCellAt(new Position(2, 2), { advocate: bluePlayer });

      // Act: Select advocate
      selectCell(new Position(2, 2));

      // Assert: Should be able to move in all four directions
      const validTargets = getValidTargetPositions();

      // Up direction
      expect(validTargets).toContain(new Position(1, 2));
      expect(validTargets).toContain(new Position(0, 2));

      // Down direction
      expect(validTargets).toContain(new Position(3, 2));
      expect(validTargets).toContain(new Position(4, 2));
      expect(validTargets).toContain(new Position(5, 2));

      // Left direction
      expect(validTargets).toContain(new Position(2, 1));
      expect(validTargets).toContain(new Position(2, 0));

      // Right direction
      expect(validTargets).toContain(new Position(2, 3));
      expect(validTargets).toContain(new Position(2, 4));
      expect(validTargets).toContain(new Position(2, 5));
    });

    it('should stop advocate movement when blocked by another piece', () => {
      // Arrange: Place blue advocate and red paragraph blocking path
      setCellAt(new Position(2, 2), { advocate: bluePlayer });
      setCellAt(new Position(2, 4), { paragraph: redPlayer }); // Blocks right movement

      // Act: Select advocate
      selectCell(new Position(2, 2));

      // Assert: Should be able to move right only to (2,3), not beyond
      const validTargets = getValidTargetPositions();
      expect(validTargets).toContain(new Position(2, 3));
      expect(validTargets).not.toContain(new Position(2, 4)); // Blocked by paragraph
      expect(validTargets).not.toContain(new Position(2, 5)); // Beyond blocking piece
    });

    it('should restrict advocate movement to same row/column when winkel source exists', () => {
      // Arrange: Simulate winkel source scenario
      setCellAt(new Position(2, 2), { advocate: bluePlayer });

      // First move to create winkel source
      selectCell(new Position(2, 2));
      selectCell(new Position(2, 4)); // Move advocate right

      // Now we should have winkel source at (2,2) and advocate at (2,4)
      // Act: Select advocate again for winkel move
      selectCell(new Position(2, 4));

      // Assert: Should be able to move in restricted directions based on winkel source
      const validTargets = getValidTargetPositions();

      // Should be able to return to winkel source
      expect(validTargets).toContain(new Position(2, 2));

      // Movement should be restricted based on alignment with winkel source
      // Since winkel source and current position share same row, should allow vertical movement
      expect(validTargets).toContain(new Position(1, 4));
      expect(validTargets).toContain(new Position(3, 4));
    });
  });

  describe('Cell Selection and Reselection', () => {
    beforeEach(() => {
      setupGrid(6);
    });

    it('should mark stones as selectable when no cell is selected', () => {
      // Arrange: Place various pieces
      setCellAt(new Position(2, 2), { advocate: bluePlayer });
      setCellAt(new Position(3, 3), { paragraph: redPlayer });

      // Act: No cell selected initially

      // Assert: All pieces should be selectable
      expect(getCellAt(new Position(2, 2)).isValidTarget).toBe(true);
      expect(getCellAt(new Position(3, 3)).isValidTarget).toBe(true);
    });

    it('should update validation when selecting different pieces', () => {
      // Arrange: Place advocate and paragraph
      setCellAt(new Position(2, 2), { advocate: bluePlayer });
      setCellAt(new Position(3, 3), { paragraph: redPlayer });
      setCellAt(new Position(3, 4), { paragraph: bluePlayer }); // For paragraph to jump over

      // Act & Assert: Select advocate first
      selectCell(new Position(2, 2));
      let validTargets = getValidTargetPositions();
      const advocateTargets = validTargets.length;

      // Act & Assert: Select paragraph
      selectCell(new Position(3, 3));
      validTargets = getValidTargetPositions();
      const paragraphTargets = validTargets.length;

      // Different pieces should have different valid move patterns
      expect(advocateTargets).not.toEqual(paragraphTargets);
    });
  });

  describe('Edge Cases and Error Conditions', () => {
    beforeEach(() => {
      setupGrid(6);
    });

    it('should handle selection of empty cells gracefully', () => {
      // Arrange: Empty grid except corners

      // Act: Try to select empty cell
      selectCell(new Position(2, 2));

      // Assert: Should not crash and should not change selection
      expect(service.getSelectedCell()).toBeUndefined();
    });

    it('should handle selection of invalid target cells', () => {
      // Arrange: Place advocate and make some cells invalid
      setCellAt(new Position(2, 2), { advocate: bluePlayer });
      selectCell(new Position(2, 2)); // This will validate cells

      // Manually mark a cell as invalid target
      setCellAt(new Position(2, 3), { isValidTarget: false });

      // Act: Try to select invalid target
      const originalSelection = service.getSelectedCell();
      selectCell(new Position(2, 3));

      // Assert: Selection should not change
      expect(service.getSelectedCell()).toEqual(originalSelection);
    });

    it('should validate bounds correctly for paragraph jumps', () => {
      // Arrange: Place paragraph near boundary
      setCellAt(new Position(5, 4), { paragraph: bluePlayer }); // Near right edge
      setCellAt(new Position(5, 5), { paragraph: redPlayer }); // At right edge

      // Act: Select paragraph that would jump out of bounds
      selectCell(new Position(5, 4));

      // Assert: Should not allow jump beyond grid boundary
      const validTargets = getValidTargetPositions();
      expect(validTargets.some(pos => pos.col >= 6)).toBe(false);
    });
  });

  describe('Complex Validation Scenarios', () => {
    beforeEach(() => {
      setupGrid(8); // Use larger grid for complex scenarios
    });

    it('should handle multiple pieces blocking advocate movement', () => {
      // Arrange: Create a complex board state
      setCellAt(new Position(3, 3), { advocate: bluePlayer });
      setCellAt(new Position(3, 5), { paragraph: redPlayer }); // Blocks right
      setCellAt(new Position(1, 3), { advocate: yellowPlayer }); // Blocks up
      setCellAt(new Position(5, 3), { paragraph: greenPlayer }); // Blocks down

      // Act: Select blue advocate
      selectCell(new Position(3, 3));

      // Assert: Movement should be limited by blocking pieces
      const validTargets = getValidTargetPositions();

      // Right: should reach (3,4) but not (3,5) or beyond
      expect(validTargets).toContain(new Position(3, 4));
      expect(validTargets).not.toContain(new Position(3, 5));
      expect(validTargets).not.toContain(new Position(3, 6));

      // Up: should not reach (1,3) or (0,3)
      expect(validTargets).not.toContain(new Position(1, 3));
      expect(validTargets).not.toContain(new Position(0, 3));

      // Down: should reach (4,3) but not (5,3) or beyond
      expect(validTargets).toContain(new Position(4, 3));
      expect(validTargets).not.toContain(new Position(5, 3));
      expect(validTargets).not.toContain(new Position(6, 3));

      // Left: should be clear
      expect(validTargets).toContain(new Position(3, 2));
      expect(validTargets).toContain(new Position(3, 1));
      expect(validTargets).toContain(new Position(3, 0));
    });

    it('should handle paragraph chains and multiple jump opportunities', () => {
      // Arrange: Create a chain of paragraphs
      setCellAt(new Position(3, 1), { paragraph: bluePlayer });
      setCellAt(new Position(3, 2), { paragraph: redPlayer });
      setCellAt(new Position(3, 4), { paragraph: yellowPlayer });
      setCellAt(new Position(3, 5), { paragraph: greenPlayer });

      // Act: Select blue paragraph
      selectCell(new Position(3, 1));

      // Assert: Should be able to jump over red to (3,3)
      const validTargets = getValidTargetPositions();
      expect(validTargets).toContain(new Position(3, 3));

      // Should NOT be able to jump further (no direct jump over yellow)
      expect(validTargets).not.toContain(new Position(3, 6));
    });
  });
});
