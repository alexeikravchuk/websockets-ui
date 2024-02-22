import db from '../db';
import { Game } from '../models/Game';
import { GameData, WinData } from '../types';
import { User } from '../models/User';

class GameController {
  private static instance: GameController;
  private static nextId = 0;

  static getInstance(): GameController {
    if (!GameController.instance) {
      GameController.instance = new GameController();
    }
    return GameController.instance;
  }

  private constructor() {
  }

  createGame(creatorId: number): GameData {
    const id = GameController.nextId++;
    const game = new Game(id, creatorId);
    db.addValue('games', game);
    return game;
  }

  getWinners(): WinData[] {
    const users = (db.getCollection('users') || []) as User[];
    return users.map((user) => ({name: user.name, wins: user.gamesWon}));
  }
}

export default GameController;
