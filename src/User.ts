import Game from "./Game";
import db from "./db";
import { MessageType, UserMessage } from './types';
import { isJSON } from './utils/isJSON';

class User {
  private readonly _send: (data: string) => void;
  name: string | null;
  game: Game;
  userId: number;

  constructor(send: (data: string) => void) {
    this._send = send;
    this.name = null;
  }

  send(data: string): void {
    try {
      this._send(data);
    } catch {
      // If trying to send to a user fails, ignore it
    }
  }

  handleMessage(msg: UserMessage): void {
    const id = msg.id;

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

  handleClose(): void {
    this.game.leave(this);
    this.game.broadcast({
      type: "note",
      text: `${this.name} left game: ${this.game.idGame}.`,
    });
  }

  static validateData(data: { name: any, password: any }): boolean {
    const {password, name} = data;

    if (!name || typeof name !== 'string') {
      return false;
    }

    if (!password || typeof password !== 'string') {
      return false
    }

    return true;
  }

  registerUser(data: any, id: string): void {
    if (!db) return console.error("db not found");

    const userId = this.userId = db.getCollection("users")?.length || 0;

    const isValid = User.validateData(data);
    if (!isValid) return this.sendError(id, 'Invalid data');

    const {password, name} = data;

    this.name = name;

    db.addValue("users", {name, password, id: userId});

    const response = {
      type: "reg",
      data: JSON.stringify({
        name,
        index: userId,
        error: false,
        errorText: "",
      }),
      id,
    };

    this.send(JSON.stringify(response));
  }

  createGame(id: string): void {
    const {idGame} = this.game = new Game();

    const response = {
      type: "create_game",
      data: JSON.stringify({
        idGame: idGame,
        idPlayer: this.userId,
      }),
      id,
    };

    this.send(JSON.stringify(response));
  }

  addShips(data: any, id: string): void {
    if (!this.game) return this.sendError(id, 'Invalid data');

    console.log("adding ships", data);

    this.send(JSON.stringify({
      type: "add_ships",
      data: JSON.stringify({
        error: false,
        errorText: "",
      }),
      id,
    }))
  }

  startGame(data: any): void {
    console.log("starting game", data);
  }

  playSingle(id: string): void {
    console.log("playing single", id);
  }

  sendError(id: string, errorText: string): void {
    this.send(JSON.stringify({
      type: 'error',
      data: errorText,
      id,
    }));
  }
}

export default User;
