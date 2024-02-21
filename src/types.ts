export type UserMessage = {
  id: string;
  type: string;
  data: string;
};

export type UserData = {
  name: string;
  password: string;
};

export enum MessageType {
  REG = "reg",
  CREATE_GAME = "create_game",
  ADD_SHIPS = "add_ships",
  START_GAME = "start_game",
  ERROR = "error",
  SINGLE_PLAY = "single_play",
}