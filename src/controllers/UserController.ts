import GameController from "./GameController";
import db from "../db";
import { GameData, MessageType, UserData, UserMessage } from '../types';
import { isJSON } from '../utils/isJSON';
import { getNextUserId } from '../utils/getNextUserId';
import { User } from '../models/User';
import * as console from 'console';

const gameController = GameController.getInstance();

class UserController {
  private readonly _send: (data: string) => void;
  currentGame: GameData;
  userData: UserData;

  constructor(send: (data: string) => void) {
    this._send = send;
  }

  handleMessage(msg: UserMessage): void {
    const id = +msg.id;
    console.log("handling message", msg);

    const data = isJSON(msg.data) && JSON.parse(msg.data);

    switch (msg.type) {
      case MessageType.REG:
        return this.registerUser(data, id);
      case MessageType.CREATE_GAME:
        return this.createGame(id);
      case MessageType.SINGLE_PLAY:
        return this.playSingle(id);
      case MessageType.ADD_SHIPS:
        return this.addShips(data, id);
      case MessageType.START_GAME:
        return this.startGame(data);
      default:
        this.sendError(id, 'Invalid message type')
    }
  }

  private validateUserData(data: { name: any, password: any }): boolean {
    const {password, name} = data;

    if (!name || typeof name !== 'string') {
      return false;
    }

    if (!password || typeof password !== 'string') {
      return false
    }

    return true;
  }

  private registerUser(data: any, id: number): void {
    if (!db) return console.error("db not found");

    const userId = getNextUserId();
    const isValid = this.validateUserData(data);
    if (!isValid) return this.sendError(id, 'Invalid data');

    const {name, password} = data;

    const user = this.userData = new User(userId, name, password);
    db.addValue("users", user);

    const dataToSend = {
      name,
      index: userId,
      error: false,
      errorText: "",
    }
    this.sendData(id, MessageType.REG, dataToSend);
    this.updateWinners(id);
  }

  private createGame(id: number): void {
    console.log("creating game", this.userData);
    const {id: userId} = this.userData;
    const {gameId} = this.currentGame = gameController.createGame(userId);

    const dataToSend = {
      idGame: gameId,
      idPlayer: userId,
    }

    console.log("creating game", dataToSend)

    this.sendData(id, MessageType.CREATE_GAME, dataToSend);
  }

  addShips(data: any, id: number): void {
    if (!this.currentGame) return this.sendError(id, 'Invalid data');

    console.log("adding ships", data);

    this.sendData(id, MessageType.ADD_SHIPS, {
      error: false,
      errorText: "",
    });
  }

  startGame(data: any): void {
    console.log("starting game", data);
  }

  updateWinners(id: number): void {
    const winners = gameController.getWinners();
    this.sendData(id, MessageType.UPDATE_WINNERS, winners);
  }

  playSingle(id: number): void {
    console.log("playing single", id);
  }

  sendError(id: number, errorText: string): void {
    this.sendData(id, MessageType.ERROR, errorText);
  }

  sendData(id: number, type: string, data: any): void {
    console.log("sending data", type, data);

    try {
      this._send(JSON.stringify({
        type,
        data: JSON.stringify(data),
        id,
      }));
    } catch (e) {
      console.log("error sending data", e)
    }
  }

  handleClose(): void {
    console.log("closing connection");
  }
}

export default UserController;
