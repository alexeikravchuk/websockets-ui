import { User } from './models/User';
import { Game } from './models/Game';
import Room from './models/Room';

export type UserMessage = {
  id: string;
  type: string;
  data: string;
};

export enum MessageType {
  REG = "reg",
  CREATE_GAME = "create_game",
  CREATE_ROOM = "create_room",
  ADD_TO_ROOM = "add_user_to_room",
  START_GAME = "start_game",
  ADD_SHIPS = "add_ships",
  ERROR = "error",
  SINGLE_PLAY = "single_play",
  TURN = "turn",
  ATTACK = "attack",
  RANDOM_ATTACK = "randomAttack",
  FINISH = "finish",
  UPDATE_ROOM = "update_room",
  UPDATE_WINNERS = "update_winners",
}

export enum FIELD_STATE {
  EMPTY = 'empty',
  SHIP = 'ship',
  MISS = 'miss',
  SHOT = 'shot',
  KILLED = 'killed'
}

export type BroadcastDataParams = {
  idUsers: string[];
  id: number;
  type: string;
  data: any;
}

export type ShipType = 'huge' | 'large' | 'medium' | 'small';

export type ShipParams = {
  direction: boolean;
  length: number;
  position: { x: number, y: number };
  type: ShipType;
}

export interface ShipData {
  direction: boolean;
  length: number;
  start: [number, number];
  type: ShipType;
  positions: [number, number][];

}

export type AddShipsData = {
  room: Room;
  userId: string;
  ships: ShipParams[];
};

export type AttackData = {
  gameId: string;
  indexPlayer: string;
  x: number;
  y: number;
};

export type AttackResult = {
  result: FIELD_STATE;
  markedCells?: [number, number][];
  killedPositions?: [number, number][];
  winner?: string;
  error?: string;
}

export type AttackResponseParams = {
  members: string[],
  result: FIELD_STATE,
  position: { x: number, y: number },
  id: number
}

export interface GameData {
  id: string;
  creatorId: number;
  isStarted: boolean;
  members: string[];
  member1Ships: ShipData[];
  member2Ships: ShipData[];
  member1Field: FIELD_STATE[][];
  member2Field: FIELD_STATE[][];
  winner: string;
  memberTurn: string;
}

export type WinData = {
  name: string;
  wins: number;
};

export interface UserData {
  id: string;
  name: string;
  password: string;
  games: string[];
  gamesWon: number;
  currentRoom: string;
}

export interface RoomData {
  creator: User;
  games: Game[];
  currentGame: Game;
  roomID: string;
}