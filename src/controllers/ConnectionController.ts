import GameController from "./GameController";
import { MessageType, UserData, UserMessage } from '../types';
import { isJSON } from '../utils/isJSON';
import { User } from '../models/User';
import * as console from 'console';
import Room from '../models/Room';

const gameController = GameController.getInstance();

class ConnectionController {
  private readonly _send: (data: string) => void;
  currentRoom: Room;
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
      case MessageType.CREATE_ROOM:
        return this.createRoom(id);
      case MessageType.ADD_TO_ROOM:
        return this.addToRoom(data, id);
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
    const isValid = this.validateUserData(data);

    if (!isValid) return this.sendError(id, 'Invalid data');

    const {name, password} = data;

    const user = this.userData = new User(name, password);

    const dataToSend = {
      name,
      index: user.id,
      error: false,
      errorText: "",
    }

    this.sendData(id, MessageType.REG, dataToSend);

    this.updateAvailableRooms(id);
    this.updateWinners(id);
  }

  private createRoom(id: number): void {
    this.currentRoom = gameController.createRoom(this.userData);
    this.updateAvailableRooms(id)
  }

  private addToRoom(data: { indexRoom: number | string }, id: number): void {
    const room = gameController.addToRoom(data.indexRoom, this.userData);

    if (room === this.currentRoom) return this.sendError(id, 'You are already in this room');

    this.currentRoom = room;

    const {id: idGame} = room.currentGame;
    const {id: idPlayer} = this.userData;

    this.sendData(id, MessageType.CREATE_GAME, {
      idGame,
      idPlayer,
    })
  }

  addShips(data: any, id: number): void {
    if (!this.currentRoom) return this.sendError(id, 'Invalid data');

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

  updateAvailableRooms(id: number): void {
    const rooms = gameController.getAvailableRooms();

    const data = rooms.map((room) => {
      const roomId = room.roomID;
      const roomUsers = room.users.map((user) => ({index: user.id, name: user.name}));
      return {roomId, roomUsers};
    });

    this.sendData(id, MessageType.UPDATE_ROOM, data);
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

export default ConnectionController;
