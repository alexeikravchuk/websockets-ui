import { Game } from './Game';
import { RoomData } from '../types';
import { User } from './User';
import { getUUID } from '../utils/getUUID';


export default class Room implements RoomData {
  static rooms: Map<string, Room> = new Map();

  creator: User;
  users: User[] = [];

  games: Game[] = [];
  currentGame: Game;
  roomID: string;

  constructor(creator: User) {
    this.roomID = getUUID();
    this.creator = creator;
    this.users.push(creator);

    Room.rooms.set(this.roomID, this);
    creator.joinRoom(this.roomID);
  }

  addUser(user: User): void {
    const users = this.users;

    if (users.includes(user)) return;

    user.joinRoom(this.roomID);
    users.push(user);
  }

  removeUser(user: User): void {
    const users = this.users;
    const index = users.indexOf(user);

    if (index === -1) return;

    users.splice(index, 1);
  }

  createGame(): Game | null {
    const users = this.users;
    if (users.length !== 2) return null

    const [user1Id, user2Id] = users.map(user => user.id) as [string, string]

    const game = new Game(user1Id, user2Id);

    this.games.push(game);
    this.currentGame = game;

    return game;
  }


  playGame(gameId: string): void {
    this.users.forEach(user => user.playGame(gameId));
  }
}
