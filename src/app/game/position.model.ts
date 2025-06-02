// src/app/game/position.model.ts

export class Position {
  constructor(
    public readonly row: number,
    public readonly col: number
  ) {}

  equals(other: Position): boolean {
    return this.row === other.row && this.col === other.col;
  }

  isValid(gridSize: number): boolean {
    return this.row >= 0 && this.row < gridSize &&
      this.col >= 0 && this.col < gridSize;
  }

  toString(): string {
    return `Position(${this.row}, ${this.col})`;
  }

  static fromArray(coords: number[]): Position {
    if (coords.length !== 2) {
      throw new Error('Coordinates array must have exactly 2 elements');
    }
    return new Position(coords[0], coords[1]);
  }

  toArray(): number[] {
    return [this.row, this.col];
  }
}
