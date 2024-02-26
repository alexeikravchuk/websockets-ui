import GameController from "./GameController";
import {
  AttackData,
  AttackResponseParams,
  BroadcastDataParams,
  FIELD_STATE,
  MessageType,
  ShipParams,
  UserMessage
} from '../types';
import { isJSON } from '../utils/isJSON';
import { User } from '../models/User';
import * as console from 'console';
import Room from '../models/Room';


class ConnectionController {
  private static users: Map<string, ConnectionController> = new Map();
  private static gameController: GameController = GameController.getInstance();
  private readonly _send: (data: string) => void;
  currentRoom: Room;
  userData: User;

  constructor(send: (data: string) => void) {
    this._send = send;
  }

  static updateRooms(id: number): void {
    for (let user of this.users.values()) {
      user.updateAvailableRooms(id);
    }
  }

  static updateWinners(id: number): void {
    for (let user of this.users.values()) {
      user.updateWinners(id);
    }
  }

  static broadcastData(params: BroadcastDataParams): void {
    const {idUsers, id, type, data} = params;
    const targetUsers = idUsers.map((id) => this.users.get(id));
    targetUsers.forEach((user) => user?.sendData(id, type, data));
  };

  handleMessage(msg: UserMessage): void {
    const id = +msg.id;
    // console.log("handling message", msg);

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
      case MessageType.ATTACK:
        return this.attack(data, id);
      case MessageType.RANDOM_ATTACK:
        return this.randomAttack(data, id);
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
    ConnectionController.users.set(user.id, this);

    const dataToSend = {
      name,
      index: user.id,
      error: false,
      errorText: "",
    }

    this.sendData(id, MessageType.REG, dataToSend);

    this.updateAvailableRooms(id);
    ConnectionController.updateWinners(id);
  }

  private createRoom(id: number): void {
    this.currentRoom = ConnectionController.gameController.createRoom(this.userData);
    ConnectionController.updateRooms(id);
  }

  private addToRoom(data: { indexRoom: string }, id: number): void {
    const room = ConnectionController.gameController.addToRoom(data.indexRoom, this.userData);

    if (room === this.currentRoom) return this.sendError(id, 'You are already in this room');

    this.currentRoom = room;

    const {id: idGame} = room.currentGame;

    room.users.forEach((user) => {
      const {id: idPlayer} = user;

      ConnectionController.broadcastData({
        idUsers: [idPlayer],
        id,
        type: MessageType.CREATE_GAME,
        data: {
          idPlayer,
          idGame,
        }
      });
    });

    ConnectionController.updateRooms(id);
  }

  private addShips(data: { ships: ShipParams[] }, id: number): void {
    if (!this.currentRoom) return this.sendError(id, 'Invalid data');

    const {ships} = data;
    ConnectionController.gameController.addShips({
      room: this.currentRoom,
      userId: this.userData.id,
      ships,
    });

    if (ConnectionController.gameController.isGameReady(this.currentRoom)) {
      this.startGame(id);
    }
  }

  private startGame(id: number): void {
    const {currentRoom} = this;
    currentRoom.playGame();
    currentRoom.users.forEach((user) => {
      const {id: idPlayer} = user;

      const ships = ConnectionController.gameController.getShips(this.currentRoom, idPlayer);

      ConnectionController.broadcastData({
        idUsers: [idPlayer],
        id,
        type: MessageType.START_GAME,
        data: {
          ships,
          currentPlayerIndex: idPlayer,
        }
      });
    });

    this.sendTurn(id);
  }

  private attack(data: AttackData, id: number): void {
    const {
      result,
      markedCells,
      winner,
      error,
      killedPositions
    } = ConnectionController.gameController.attack(this.currentRoom, data);

    if (error) {
      return this.sendError(id, error);
    }

    const {members} = this.currentRoom.currentGame;
    const {x, y} = data;
    this.attackResponse({members, result, position: {x, y}, id})

    if (markedCells && markedCells.length) {
      markedCells.forEach(([x, y]) => {
        this.attackResponse({members, result: FIELD_STATE.MISS, position: {x, y}, id});
      });
    }

    if (killedPositions && killedPositions.length) {
      killedPositions.forEach(([x, y]) => {
        this.attackResponse({members, result: FIELD_STATE.KILLED, position: {x, y}, id});
      });
    }

    if (winner) {
      ConnectionController.broadcastData({
        idUsers: members,
        type: MessageType.FINISH,
        data: {
          winPlayer: winner,
        },
        id,
      });

      return ConnectionController.updateWinners(id);
    }

    this.sendTurn(id);
  }


  private attackResponse(params: AttackResponseParams,): void {
    const {members, result, position, id} = params;
    const currentPlayer = this.userData.id;

    ConnectionController.broadcastData({
      idUsers: members,
      type: MessageType.ATTACK,
      data: {
        status: result,
        currentPlayer,
        position,
      },
      id,
    })
  }

  private randomAttack(data: { indexPlayer: string, gameId: string }, id: number): void {
    const [x, y] = ConnectionController.gameController.getRandomEnemyCoords(this.currentRoom, data);
    this.attack({x, y, ...data}, id)
  }

  private sendTurn(id: number): void {
    const {memberTurn, members} = this.currentRoom.currentGame
    ConnectionController.broadcastData({
      idUsers: members,
      id,
      type: MessageType.TURN,
      data: {
        currentPlayer: memberTurn,
      }
    })
  }

  private updateWinners(id: number): void {
    const winners = ConnectionController.gameController.getWinners();
    this.sendData(id, MessageType.UPDATE_WINNERS, winners);
  }

  private updateAvailableRooms(id: number): void {
    const rooms = ConnectionController.gameController.getAvailableRooms();

    const data = rooms.map((room) => {
      const roomId = room.roomID;
      const roomUsers = room.users.map((user) => ({index: user.id, name: user.name}));
      return {roomId, roomUsers};
    });

    this.sendData(id, MessageType.UPDATE_ROOM, data);
  }


  private playSingle(id: number): void {
    console.log("playing single", id);
  }

  private sendError(id: number, errorText: string): void {
    this.sendData(id, MessageType.ERROR, errorText);
  }

  private sendData(id: number, type: string, data: any): void {
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
    this.enemyWin(0)
    ConnectionController.users.delete(this.userData.id);
    ConnectionController.gameController.logoutUser(this.userData);
    ConnectionController.updateRooms(0);

    console.log("user disconnected", this.userData.id);
  }

  private enemyWin(id: number): void {
    const {currentRoom} = this;
    const otherUser = currentRoom.users.find((user) => user.id !== this.userData.id);

    if (otherUser) {
      ConnectionController.broadcastData({
        idUsers: [otherUser.id],
        type: MessageType.FINISH,
        data: {
          winPlayer: otherUser?.id,
        },
        id,
      });
      ConnectionController.updateWinners(0);
    }
  }
}

export default ConnectionController;
