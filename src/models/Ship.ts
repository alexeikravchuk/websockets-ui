import { FIELD_STATE, ShipData, ShipParams } from '../types';

export default class Ship implements ShipData {
  direction: boolean;
  length: number;
  start: [number, number];
  type: 'huge' | 'large' | 'medium' | 'small';
  positions: [number, number][] = [];

  constructor(params: ShipParams) {
    const {direction, length, position, type} = params;
    this.direction = direction;
    this.length = length;
    this.start = [position.x, position.y];
    this.type = type;

    this.fillPositions();
  }

  get data(): ShipParams {
    return {
      direction: this.direction,
      length: this.length,
      position: {x: this.start[0], y: this.start[1]},
      type: this.type
    }
  }

  private fillPositions(): void {
    const {direction, length, start} = this;
    const [x, y] = start; // x - column, y - row

    if (direction) {
      for (let i = 0; i < length; i++) {
        this.positions.push([x, y + i]);
      }
    } else {
      for (let i = 0; i < length; i++) {
        this.positions.push([x + i, y]);
      }
    }
  }

  isHit(x: number, y: number): boolean {
    return this.positions.some(([posX, posY]) => posX === x && posY === y);
  }

  isKilled(field: FIELD_STATE[][]): boolean {
    return this.positions.every(([x, y]) => field[x]![y] === FIELD_STATE.SHOT);
  }
}