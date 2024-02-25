import { UserData } from '../types';
import db from '../db';
import { getUUID } from '../utils/getUUID';

export class User implements UserData {
  id: string;
  name: string;
  password: string;
  currentRoom: string = '';
  games: string[] = [];
  gamesWon: number = 0;

  constructor(name: string, password: string) {
    this.id = getUUID();
    this.name = name;
    this.password = password;

    db.addValue("users", {name, password, id: this.id});
  }

  playGame(gameId: string): void {
    this.games.push(gameId);
  }

  winGame(): void {
    this.gamesWon++;
  }

  joinRoom(roomId: string): void {
    this.currentRoom = roomId;
  }
}
