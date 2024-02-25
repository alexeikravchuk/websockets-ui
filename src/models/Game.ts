import { AttackData, FIELD_STATE, GameData, Ship } from '../types';
import { getUUID } from '../utils/getUUID';

const getEmptyField = () => {
  return Array(10).fill(Array(10).fill(FIELD_STATE.EMPTY));
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
    this.memberTurn = this.members[0]!;
  }

  setTurn(memberId: string): void {
    this.memberTurn = memberId;
  }

  setShips(memberId: string, ships: Ship[]): void {
    if (memberId === this.members[0]) {
      this.member1Ships = ships;
      this.fillField(this.member1Field, ships);
    } else {
      this.member2Ships = ships;
      this.fillField(this.member2Field, ships);
    }
  }

  private fillField(field: FIELD_STATE[][], ships: Ship[]): void {
    ships.forEach((ship) => {
      const {position, direction, length} = ship;
      const {x, y} = position;

      if (direction) {
        for (let i = 0; i < length; i++) {
          const row = field[x + i];
          if (!row) return;
          row[y] = FIELD_STATE.SHIP;
        }
      } else {
        for (let i = 0; i < length; i++) {
          const row = field[x];
          if (!row) return;
          row[y + i] = FIELD_STATE.SHIP;
        }
      }
    });
  }

  getShips(memberId: string): Ship[] {
    if (memberId === this.members[0]) {
      return this.member1Ships;
    } else {
      return this.member2Ships;
    }
  }

  isReady(): boolean {
    const firsReady = this.member1Ships.length === 10;
    const secondReady = this.member2Ships.length === 10;
    return firsReady && secondReady;
  }

  attack(data: AttackData): FIELD_STATE {
    const {x, y, indexPlayer} = data;
    if (indexPlayer !== this.memberTurn) throw new Error('Not your turn');

    const {HIT, MISS, SHIP} = FIELD_STATE

    const field = indexPlayer === this.members[0] ? this.member2Field : this.member1Field;

    const row = field[x]!;
    const cell = row[y]!;

    const result = cell === SHIP ? HIT : MISS
    row[y] = result

    return result;
  }
}
