import User from "./User";
import db from './db';

let nextId = 0;

class Game {
  private readonly _id: number;
  members: [User?, User?] = [];

  private constructor(creator: User) {
    this._id = nextId++;
    this.members.push(creator);
  }

  static get(id: number): Game | null {
    const game = db.getCollection('games')?.[id];

    if (!game) {
      return null;
    }

    return game;
  }

  static createGame(creator: User): Game {
    const game = new Game(creator);
    db.addValue('games', game);
    return game;
  }

  get idGame(): number {
    return this._id;
  }

  join(member: User): void {
    this.members.push(member);
  }

  leave(): void {
    this.members = [];
  }

  getMembers(): [User?, User?] {
    return this.members;
  }

  getMember(name: string): User | undefined {
    for (let member of this.members) {
      if (member && member.name === name) return member;
    }
  }
}

export default Game;
