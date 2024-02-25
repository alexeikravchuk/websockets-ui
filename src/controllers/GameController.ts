import db from '../db';
import { AddShipsData, AttackData, AttackResult, FIELD_STATE, ShipParams, UserData, WinData } from '../types';
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

  createRoom(creator: User): Room {
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

  addShips({room, userId, ships}: AddShipsData): void {
    const game = room.currentGame;
    if (!game) return;

    game.setShips(userId, ships);
  }

  getShips(room: Room, userId: string): ShipParams[] {
    const game = room.currentGame;
    return game.getShips(userId);
  }

  attack(room: Room, data: AttackData): AttackResult {
    const game = room.currentGame;

    const result = game.attack(data);

    if (result !== FIELD_STATE.KILLED) {
      return {result};
    }

    const markedCells = game.markCellsAroundShip(data);
    return {result, markedCells, winner: game.winner};
  }

  isGameReady(room: Room): boolean {
    const game = room.currentGame;
    if (!game) return false;

    const isReady = game.isReady();

    if (isReady) {
      game.startGame();
    }

    return isReady;
  }

  logoutUser(user: User): void {
    const room = this.rooms.get(user.currentRoom);
    room?.removeUser(user);
  }
}

export default GameController;
