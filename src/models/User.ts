import { UserData } from '../types';

export class User implements UserData {
  id: number;
  name: string;
  password: string;
  games: string[];
  gamesWon: number = 0;

  constructor(id: number, name: string, password: string) {
    this.id = id;
    this.name = name;
    this.password = password;
  }
}
