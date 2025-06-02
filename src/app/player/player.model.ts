// src/app/player/player.model.ts
import { PlayerColor } from '../game/game.config';

export class Player {
  constructor(
    public color: PlayerColor,
    public eaten: number = 0
  ) {}

  addEaten(points: number): void {
    this.eaten += points;
  }

  getTotalEaten(): number {
    return this.eaten;
  }

  equals(other: Player): boolean {
    return this.color === other.color;
  }

  toString(): string {
    return `Player(${this.color}, eaten: ${this.eaten})`;
  }
}
