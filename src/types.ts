import { User } from './models/User';
import { Game } from './models/Game';

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
  FINISH = "finish",
  UPDATE_ROOM = "update_room",
  UPDATE_WINNERS = "update_winners",
}

export enum FIELD_STATE {
  EMPTY = 0,
  SHIP = 1,
  MISS = 2,
  HIT = 3,
}

export interface GameData {
  id: string;
  creatorId: number;
  isStarted: boolean;
  members: string[];
  member1Ships: { [key: string]: number[][] };
  member2Ships: { [key: string]: number[][] };
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
}

export interface RoomData {
  creator: User;
  games: Game[];
  currentGame: Game;
  roomID: string;
}