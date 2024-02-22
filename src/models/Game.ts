import { FIELD_STATE, GameData } from '../types';

const getEmptyField = () => {
  return Array(10).fill(Array(10).fill(FIELD_STATE.EMPTY));
};

export class Game implements GameData {
  gameId: number;
  creatorId: number;
  isStarted: boolean = false;
  members: string[] = [];
  member1Ships: { [key: string]: number[][] } = {};
  member2Ships: { [key: string]: number[][] } = {};
  member1Field: FIELD_STATE[][] = getEmptyField();
  member2Field: FIELD_STATE[][] = getEmptyField();
  winner: string = '';
  memberTurn: string = '';

  constructor(id: number, creatorId: number) {
    this.gameId = id;
    this.creatorId = creatorId;
    this.members.push(creatorId.toString());
  }
}
