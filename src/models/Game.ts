import { AttackData, FIELD_STATE, GameData, ShipParams } from '../types';
import { getUUID } from '../utils/getUUID';
import Ship from './Ship';

const getEmptyField = () => {
  const field = new Array(10).fill(null);
  field.forEach((_, i) => {
    field[i] = new Array(10).fill(FIELD_STATE.EMPTY);
  });
  return field;
};

export class Game implements GameData {
  id: string;
  creatorId: number;
  isStarted: boolean = false;
  members: string[] = [];
  member1Ships: Ship[] = [];
  member2Ships: Ship[] = [];
  member1Field: FIELD_STATE[][] = getEmptyField();
  member2Field: FIELD_STATE[][] = getEmptyField();
  winner: string = '';
  memberTurn: string = '';

  constructor(member1Id: string, member2Id: string) {
    this.id = getUUID();
    this.members.push(member1Id, member2Id);
  }

  startGame(): void {
    if (this.members.length !== 2) return;

    this.isStarted = true;
    this.setTurn(this.members[0]!);
  }

  private setTurn(memberId: string): void {
    this.memberTurn = memberId;
  }

  setShips(memberId: string, ships: ShipParams[]): void {
    const shipsData: Ship[] = ships.map(ship => new Ship(ship));

    if (memberId === this.members[0]) {
      this.member1Ships = shipsData;
      this.fillField(this.member1Field, ships);
    } else {
      this.member2Ships = shipsData;
      this.fillField(this.member2Field, ships);
    }
  }

  private fillField(field: FIELD_STATE[][], ships: ShipParams[]): void {
    ships.forEach((ship) => {
      const {position, direction, length} = ship;
      const {x, y} = position;

      if (direction) { // vertical
        const row = field[x]!;
        for (let i = 0; i < length; i++) {
          row[y + i] = FIELD_STATE.SHIP;
        }
      } else {
        for (let i = 0; i < length; i++) {
          field[x + i]![y] = FIELD_STATE.SHIP;
        }
      }
    });
    console.log(ships, field)
  }

  getShips(memberId: string): ShipParams[] {
    const {member1Ships, member2Ships} = this;
    const ships = memberId === this.members[0] ? member1Ships : member2Ships;
    return ships.map(ship => ship.data)
  }

  isReady(): boolean {
    const firsReady = this.member1Ships.length === 10;
    const secondReady = this.member2Ships.length === 10;
    return firsReady && secondReady;
  }

  attack(data: AttackData): FIELD_STATE {
    const {x, y, indexPlayer} = data;
    if (indexPlayer !== this.memberTurn) throw new Error('Not your turn');

    const {SHOT, MISS, SHIP} = FIELD_STATE

    const field = indexPlayer === this.members[0] ? this.member2Field : this.member1Field;

    const row = field[x]!;
    const cell = row[y]!;

    let result = row[y] = cell === SHIP ? SHOT : MISS;

    if (result === MISS) {
      const nextTurn = indexPlayer === this.members[0] ? this.members[1]! : this.members[0]!;
      this.setTurn(nextTurn);

      return MISS;
    }


    const targetShip = this.getShipFromField(x, y, indexPlayer);
    if (!targetShip) throw new Error('Ship not found');

    const isKilled = targetShip.isKilled(field);
    if (!isKilled) {
      return SHOT;
    }

    result = FIELD_STATE.KILLED;

    const enemyShips = indexPlayer === this.members[0] ? this.member2Ships : this.member1Ships;
    const isAllKilled = enemyShips.every(ship => ship.isKilled(field));

    if (isAllKilled) {
      this.winner = indexPlayer;
    }

    return result;
  }

  getEnemyEmptyCells(playerIndex: string): [number, number][] {
    const field = playerIndex === this.members[0] ? this.member2Field : this.member1Field;
    const emptyCells: [number, number][] = [];

    field.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell === FIELD_STATE.EMPTY) {
          emptyCells.push([i, j]);
        }
      });
    });

    return emptyCells;
  }

  markCellsAroundShip(data: AttackData): [number, number][] {
    const {x, y, indexPlayer} = data;
    // const field = indexPlayer === this.members[0] ? this.member2Field : this.member1Field;

    const targetShip = this.getShipFromField(x, y, indexPlayer);
    if (!targetShip) throw new Error('Ship not found');

    const markedCells: [number, number][] = [];

    /*targetShip.positions.forEach(([posX, posY]) => {
     for (let i = -1; i < 2; i++) {
     for (let j = -1; j < 2; j++) {
     const row = field[posX + i];
     const cell = row && row[posY + j];
     if (cell && cell === FIELD_STATE.EMPTY) {
     row[posY + j] = FIELD_STATE.MISS;
     markedCells.push([posX + i, posY + j]);
     }
     }
     }
     });*/

    return markedCells;
  }

  getShipFromField(x: number, y: number, indexPlayer: string): Ship | undefined {
    const targetShips = indexPlayer === this.members[0] ? this.member2Ships : this.member1Ships;
    const targetShip = targetShips.find((ship) => ship.isHit(x, y));
    if (!targetShip) return undefined;

    return targetShip;
  }
}
