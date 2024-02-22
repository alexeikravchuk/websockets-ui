export type UserMessage = {
  id: string;
  type: string;
  data: string;
};

export enum MessageType {
  REG = "reg",
  CREATE_GAME = "create_room",
  UPDATE_WINNERS = "update_winners",
  ADD_SHIPS = "add_ships",
  START_GAME = "start_game",
  ERROR = "error",
  SINGLE_PLAY = "single_play",
}

export enum FIELD_STATE {
  EMPTY = 0,
  SHIP = 1,
  MISS = 2,
  HIT = 3,
}

export interface GameData {
  gameId: number;
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
  id: number;
  name: string;
  password: string;
  games: string[];
  gamesWon: number;
}
