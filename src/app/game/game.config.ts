// src/app/game/game.config.ts

export const GAME_CONFIG = {
  GRID: {
    NORMAL_SIZE: 8,
    TURBO_BLOCKCHAIN_SIZE: 6,
    MIN_SIZE: 6,
    MAX_SIZE: 8
  },

  PLAYERS: {
    MIN_COUNT: 2,
    MAX_COUNT: 4,
    COLORS: ['blue', 'red', 'yellow', 'green'] as const,
    STARTING_EATEN: 0
  },

  SCORING: {
    BASE_MULTIPLIER: 2,
    CORNER_POINTS: 0
  },

  MOVEMENT: {
    PARAGRAPH_JUMP_DISTANCE: 2,
    DIRECTIONS: {
      UP: [-1, 0],
      DOWN: [1, 0],
      LEFT: [0, -1],
      RIGHT: [0, 1]
    } as const
  },

  UI: {
    PULSE_ANIMATION_DURATION: '1s',
    CELL_BORDER_RADIUS: '6px',
    GRID_GAP: '4px'
  }
} as const;

// Type definitions for better type safety
export type PlayerColor = typeof GAME_CONFIG.PLAYERS.COLORS[number];
export type Direction = typeof GAME_CONFIG.MOVEMENT.DIRECTIONS[keyof typeof GAME_CONFIG.MOVEMENT.DIRECTIONS];

// Helper functions
export class GameConfigHelper {
  static isValidPlayerCount(count: number): boolean {
    return count >= GAME_CONFIG.PLAYERS.MIN_COUNT && count <= GAME_CONFIG.PLAYERS.MAX_COUNT;
  }

  static isValidGridSize(size: number): boolean {
    return size >= GAME_CONFIG.GRID.MIN_SIZE && size <= GAME_CONFIG.GRID.MAX_SIZE;
  }

  static getPlayerColorsForCount(count: number): PlayerColor[] {
    if (!this.isValidPlayerCount(count)) {
      throw new Error(`Invalid player count: ${count}. Must be between ${GAME_CONFIG.PLAYERS.MIN_COUNT} and ${GAME_CONFIG.PLAYERS.MAX_COUNT}`);
    }
    return GAME_CONFIG.PLAYERS.COLORS.slice(0, count);
  }

  static calculateCellValue(distance: number): number {
    return Math.pow(GAME_CONFIG.SCORING.BASE_MULTIPLIER, distance);
  }

  static getGridSizeLabel(size: number): string {
    return `${size}x${size}`;
  }
}
