import db from '../db';
import { UserData, WinData } from '../types';
import Room from '../models/Room';
import { User } from '../models/User';

class GameController {
  private static instance: GameController;
  private rooms: Map<string, Room> = new Map();

  static getInstance(): GameController {
    if (!GameController.instance) {
      GameController.instance = new GameController();
    }
    return GameController.instance;
  }

  private constructor() {
  }

  createRoom(creator: UserData): Room {
    const room = new Room(creator);
    const indexRoom = room.roomID;
    this.rooms.set(indexRoom, room);
    return room;
  }

  addToRoom(indexRoom: string, user: User): Room {
    const room = this.rooms.get(indexRoom);

    if (!room) {
      throw new Error('Room not found');
    }

    room.addUser(user);
    room.createGame();

    return room;
  }

  getAvailableRooms(): Room[] {
    return [...this.rooms.values()].filter((room) => room.users.length < 2);
  }

  getWinners(): WinData[] {
    const users = (db.getCollection('users') || []) as UserData[];
    const winnersData = users.map((user) => ({name: user.name, wins: user.gamesWon}));
    return winnersData.filter((user) => user.wins > 0);
  }
}

export default GameController;
