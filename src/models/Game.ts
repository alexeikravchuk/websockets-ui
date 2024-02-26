import { AttackData, AttackResult, FIELD_STATE, GameData, ShipParams } from '../types';
import { getUUID } from '../utils/getUUID';
import { getEmptyField } from '../utils/getEmptyField';
import Ship from './Ship';



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

  private getAttackResult(data: AttackData): FIELD_STATE {
    const {x, y, indexPlayer} = data;
    if (indexPlayer !== this.memberTurn) throw new Error('Not your turn');

    const {SHOT, MISS, SHIP, EMPTY} = FIELD_STATE

    const field = indexPlayer === this.members[0] ? this.member2Field : this.member1Field;

    const row = field[x]!;
    const cell = row[y]!;

    const isCellEmpty = cell === EMPTY;
    const isCellShip = cell === SHIP;

    if (!isCellEmpty && !isCellShip) throw new Error('Cell is not empty');

    let result = row[y] = isCellShip ? SHOT : MISS;

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

  attack(data: AttackData): AttackResult {
    const result = this.getAttackResult(data);

    if (result !== FIELD_STATE.KILLED) {
      return {result};
    }

    const markedCells = this.markCellsAroundShip(data);
    const shipKilled = this.getShipFromField(data.x, data.y, data.indexPlayer);
    const killedPositions = shipKilled!.positions;

    return {result, markedCells, winner: this.winner, killedPositions};
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

  private markCellsAroundShip(data: AttackData): [number, number][] {
    const {x, y, indexPlayer} = data;
    const field = indexPlayer === this.members[0] ? this.member2Field : this.member1Field;

    const targetShip = this.getShipFromField(x, y, indexPlayer);
    if (!targetShip) throw new Error('Ship not found');

    const markedCells: [number, number][] = [];

    targetShip.positions.forEach(([posX, posY]) => {
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
    });

    return markedCells;
  }

  getShipFromField(x: number, y: number, indexPlayer: string): Ship | undefined {
    const targetShips = indexPlayer === this.members[0] ? this.member2Ships : this.member1Ships;
    const targetShip = targetShips.find((ship) => ship.isHit(x, y));
    if (!targetShip) return undefined;

    return targetShip;
  }
}
