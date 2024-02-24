import { FIELD_STATE, GameData } from '../types';
import { getUUID } from '../utils/getUUID';

const getEmptyField = () => {
  return Array(10).fill(Array(10).fill(FIELD_STATE.EMPTY));
};

export class Game implements GameData {
  static nextId = 0;
  id: string;
  creatorId: number;
  isStarted: boolean = false;
  members: string[] = [];
  member1Ships: { [key: string]: number[][] } = {};
  member2Ships: { [key: string]: number[][] } = {};
  member1Field: FIELD_STATE[][] = getEmptyField();
  member2Field: FIELD_STATE[][] = getEmptyField();
  winner: string = '';
  memberTurn: string = '';

  constructor(member1Id: string, member2Id: string) {
    this.id = getUUID();
    this.members.push(member1Id, member2Id);
  }
}
