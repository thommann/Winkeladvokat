// src/app/game/game.service.helper-methods.spec.ts
import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { PlayerService } from '../player/player.service';
import { GridService } from '../grid/grid.service';
import { Player } from '../player/player.model';
import { Position } from './position.model';

describe('GameService - Helper Methods and Internal Logic', () => {
  let service: GameService;
  let gridService: GridService;

  const bluePlayer = new Player('blue');
  const redPlayer = new Player('red');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GameService, PlayerService, GridService]
    });
    service = TestBed.inject(GameService);
    gridService = TestBed.inject(GridService);
  });

  function setupGrid(size: number = 6): void {
    gridService.setGridSize(size);
    service.initializePlayers(2);
    service.initializeGrid();
  }

  function setCellAt(position: Position, updates: any): void {
    const cell = service.grid[position.row][position.col];
    Object.assign(cell, updates);
  }

  // We need to access private methods for testing, so we'll cast to any
  function getPrivateMethod(methodName: string): any {
    return (service as any)[methodName].bind(service);
  }

  describe('Grid Initialization', () => {
    it('should initialize grid with correct cell values', () => {
      // Act
      setupGrid(6);

      // Assert: Check corner cells have no points
      expect(service.grid[0][0].value).toBe(0); // Corner
      expect(service.grid[0][5].value).toBe(0); // Corner
      expect(service.grid[5][0].value).toBe(0); // Corner
      expect(service.grid[5][5].value).toBe(0); // Corner

      // Assert: Check distance-based scoring
      expect(service.grid[1][1].value).toBe(Math.pow(2, 2)); // Distance 2 from edge
      expect(service.grid[2][2].value).toBe(Math.pow(2, 3)); // Distance 3 from edge
      expect(service.grid[3][3].value).toBe(Math.pow(2, 3)); // Distance 3 from edge
    });

    it('should place starting advocates in corners for 2 players', () => {
      // Act
      setupGrid(6);

      // Assert: Check corner advocates are placed correctly
      expect(service.grid[0][0].advocate?.color).toBe('blue');
      expect(service.grid[0][5].advocate?.color).toBe('red');
      expect(service.grid[5][5].advocate).toBeUndefined(); // Only 2 players
      expect(service.grid[5][0].advocate).toBeUndefined(); // Only 2 players
    });

    it('should place starting advocates in corners for 4 players', () => {
      // Arrange
      gridService.setGridSize(6);
      service.initializePlayers(4);

      // Act
      service.initializeGrid();

      // Assert: All corners should have advocates
      expect(service.grid[0][0].advocate?.color).toBe('blue');
      expect(service.grid[0][5].advocate?.color).toBe('red');
      expect(service.grid[5][5].advocate?.color).toBe('yellow');
      expect(service.grid[5][0].advocate?.color).toBe('green');
    });
  });

  describe('Cell Distance Calculation', () => {
    beforeEach(() => {
      setupGrid(8); // Use 8x8 for more varied distances
    });

    it('should calculate distances correctly for all cells', () => {
      // Verify grid size is actually 8
      expect(gridService.getGridSize()).toBe(8);

      // Test various positions and their expected distances
      // Distance = min(row, col, gridSize-1-row, gridSize-1-col) + 1
      const testCases = [
        { pos: new Position(0, 1), expectedDistance: 1 }, // min(0,1,7,6) + 1 = 0 + 1 = 1
        { pos: new Position(1, 0), expectedDistance: 1 }, // min(1,0,6,7) + 1 = 0 + 1 = 1
        { pos: new Position(1, 1), expectedDistance: 2 }, // min(1,1,6,6) + 1 = 1 + 1 = 2
        { pos: new Position(2, 2), expectedDistance: 3 }, // min(2,2,5,5) + 1 = 2 + 1 = 3
        { pos: new Position(3, 3), expectedDistance: 4 }, // min(3,3,4,4) + 1 = 3 + 1 = 4
        { pos: new Position(4, 4), expectedDistance: 4 }, // min(4,4,3,3) + 1 = 3 + 1 = 4
        { pos: new Position(7, 6), expectedDistance: 1 }, // min(7,6,0,1) + 1 = 0 + 1 = 1 (CORRECTED!)
      ];

      testCases.forEach(({ pos, expectedDistance }) => {
        const actualDistance = service.grid[pos.row][pos.col].distance;
        expect(actualDistance).toBe(expectedDistance,
          `Position (${pos.row}, ${pos.col}) should have distance ${expectedDistance} but got ${actualDistance}`);
      });
    });
  });

  describe('Validation State Management', () => {
    beforeEach(() => {
      setupGrid(6);
    });

    it('should invalidate all cells correctly', () => {
      // Arrange: Set some cells as valid
      service.grid[1][1].isValidTarget = true;
      service.grid[2][2].isValidTarget = true;
      service.grid[3][3].isValidTarget = true;

      // Act: Use private method to invalidate all
      const invalidateAllCells = getPrivateMethod('invalidateAllCells');
      invalidateAllCells();

      // Assert: All cells should be invalid
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
          expect(service.grid[i][j].isValidTarget).toBe(false);
          expect(service.grid[i][j].validTargetColor).toBe("");
        }
      }
    });

    it('should validate cells with stones correctly', () => {
      // Arrange: Use actual player objects from the game
      const gameBluePlayer = service.getPlayers().find(p => p.color === 'blue')!;
      const gameRedPlayer = service.getPlayers().find(p => p.color === 'red')!;

      setCellAt(new Position(2, 2), { advocate: gameBluePlayer });
      setCellAt(new Position(3, 3), { paragraph: gameRedPlayer });
      setCellAt(new Position(3, 4), { paragraph: gameBluePlayer }); // For red paragraph to potentially jump

      // First invalidate all
      const invalidateAllCells = getPrivateMethod('invalidateAllCells');
      invalidateAllCells();

      // Act: Validate stones
      const validateCellsWithStones = getPrivateMethod('validateCellsWithStones');
      validateCellsWithStones();

      // Assert: Stones should be marked as valid targets
      expect(service.grid[2][2].isValidTarget).toBe(true); // Advocate
      expect(service.grid[3][3].isValidTarget).toBe(true); // Paragraph with possible moves
    });
  });

  describe('Direction-based Validation', () => {
    beforeEach(() => {
      setupGrid(6);
    });

    it('should validate advocate movement in single direction correctly', () => {
      // Arrange: Use actual player objects
      const gameBluePlayer = service.getPlayers().find(p => p.color === 'blue')!;
      const gameRedPlayer = service.getPlayers().find(p => p.color === 'red')!;

      setCellAt(new Position(2, 2), { advocate: gameBluePlayer });
      setCellAt(new Position(2, 4), { paragraph: gameRedPlayer }); // Blocks rightward movement

      // First invalidate all
      const invalidateAllCells = getPrivateMethod('invalidateAllCells');
      invalidateAllCells();

      // Act: Validate advocate movement to the right
      const validateAdvocateAt = getPrivateMethod('validateAdvocateAt');
      validateAdvocateAt(new Position(2, 2), 0, 1); // Right direction

      // Assert: Should validate up to blocking piece
      expect(service.grid[2][3].isValidTarget).toBe(true);
      expect(service.grid[2][4].isValidTarget).toBe(false); // Blocked
      expect(service.grid[2][5].isValidTarget).toBe(false); // Beyond block
    });

    it('should validate paragraph movement in specific direction', () => {
      // Arrange: Use actual player objects
      const gameBluePlayer = service.getPlayers().find(p => p.color === 'blue')!;
      const gameRedPlayer = service.getPlayers().find(p => p.color === 'red')!;

      setCellAt(new Position(2, 1), { paragraph: gameBluePlayer });
      setCellAt(new Position(2, 2), { paragraph: gameRedPlayer });

      // Act: Check if direction is valid for paragraph jump
      const isValidCellForParagraphInDirection = getPrivateMethod('isValidCellForParagraphInDirection');
      const result = isValidCellForParagraphInDirection(
        new Position(2, 1),
        gameBluePlayer,
        0,
        2 // Right direction, 2 cells
      );

      // Assert: Should be valid (can jump over red paragraph)
      expect(result).toBe(true);
    });
  });

  describe('Score Calculation', () => {
    beforeEach(() => {
      setupGrid(6);
    });

    it('should calculate player paragraph points correctly', () => {
      // Arrange: Use actual player objects from the game
      const gameBluePlayer = service.getPlayers().find(p => p.color === 'blue')!;
      const gameRedPlayer = service.getPlayers().find(p => p.color === 'red')!;

      setCellAt(new Position(1, 1), { paragraph: gameBluePlayer }); // Value: 4 (distance 2)
      setCellAt(new Position(2, 2), { paragraph: gameBluePlayer }); // Value: 8 (distance 3)
      setCellAt(new Position(3, 3), { paragraph: gameRedPlayer });  // Value: 8 (distance 3)

      // Act: Calculate scores using private method
      const getPlayerParagraphPoints = getPrivateMethod('getPlayerParagraphPoints');
      const bluePoints = getPlayerParagraphPoints('blue');
      const redPoints = getPlayerParagraphPoints('red');

      // Assert: Correct paragraph points
      expect(bluePoints).toBe(4 + 8); // 12 total
      expect(redPoints).toBe(8);      // 8 total
    });

    it('should include eaten points in total score', () => {
      // Arrange: Use actual player object from the game and set eaten points
      const gameBluePlayer = service.getPlayers().find(p => p.color === 'blue')!;
      gameBluePlayer.eaten = 3; // Set eaten points on the actual player object
      setCellAt(new Position(1, 1), { paragraph: gameBluePlayer }); // Value: 4

      // Act: Get total score
      const totalScore = service.getPlayerScore('blue');

      // Assert: Should include both eaten and paragraph points
      expect(totalScore).toBe(3 + 4); // eaten + paragraph points
    });
  });

  describe('Position Utilities', () => {
    beforeEach(() => {
      setupGrid(6);
    });

    it('should find cell in between two positions correctly', () => {
      // Act: Test horizontal positions
      const getCellInBetween = getPrivateMethod('getCellInBetween');

      // Horizontal test
      const cellBetweenHorizontal = getCellInBetween(
        new Position(2, 1),
        new Position(2, 3)
      );
      expect(cellBetweenHorizontal).toBe(service.grid[2][2]);

      // Vertical test
      const cellBetweenVertical = getCellInBetween(
        new Position(1, 2),
        new Position(3, 2)
      );
      expect(cellBetweenVertical).toBe(service.grid[2][2]);
    });

    it('should throw error for diagonal positions', () => {
      // Arrange & Act & Assert: Should throw for diagonal
      const getCellInBetween = getPrivateMethod('getCellInBetween');

      expect(() => {
        getCellInBetween(new Position(1, 1), new Position(3, 3));
      }).toThrow();
    });
  });

  describe('Player Management', () => {
    it('should get starting player for corner positions correctly', () => {
      // Arrange
      setupGrid(6);

      // Act & Assert: Test corner positions
      expect(service.getStartingPlayer(0, 0)?.color).toBe('blue');  // Top-left
      expect(service.getStartingPlayer(0, 5)?.color).toBe('red');   // Top-right
      expect(service.getStartingPlayer(5, 5)).toBeUndefined();      // Bottom-right (only 2 players)
      expect(service.getStartingPlayer(5, 0)).toBeUndefined();      // Bottom-left (only 2 players)

      // Non-corner positions should return undefined
      expect(service.getStartingPlayer(1, 1)).toBeUndefined();
      expect(service.getStartingPlayer(2, 3)).toBeUndefined();
    });

    it('should handle player count validation', () => {
      // Act & Assert: Valid player counts
      expect(() => service.initializePlayers(2)).not.toThrow();
      expect(() => service.initializePlayers(3)).not.toThrow();
      expect(() => service.initializePlayers(4)).not.toThrow();

      // Invalid player counts
      expect(() => service.initializePlayers(1)).toThrow();
      expect(() => service.initializePlayers(5)).toThrow();
    });
  });
});
