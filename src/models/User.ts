import { UserData } from '../types';
import db from '../db';
import { getUUID } from '../utils/getUUID';

export class User implements UserData {
  static nextId = 0;
  id: string;
  name: string;
  password: string;
  games: string[];
  gamesWon: number = 0;

  constructor(name: string, password: string) {
    this.id = getUUID();
    this.name = name;
    this.password = password;

    db.addValue("users", this);
  }
}
