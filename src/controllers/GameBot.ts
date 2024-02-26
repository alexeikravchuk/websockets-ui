import Room from '../models/Room';
import ConnectionController from './ConnectionController';

import { getUUID } from '../utils/getUUID';
import { getEmptyField } from '../utils/getEmptyField';
import { FIELD_STATE, MessageType, ShipParams, ShipType } from '../types';

export class GameBot {
  static counter: number = 0;
  private controller: ConnectionController;
  id = getUUID()
  name = `GameBot_${GameBot.counter++}`;
  room: Room;
  idGame: string;
  indexPlayer: string;

  ships: ShipParams[] = [];
  field: FIELD_STATE[][] = getEmptyField();
  enemyField: FIELD_STATE[][] = getEmptyField();

  constructor(room: Room) {
    this.room = room;
    this.initBotUser();
    this.addToRoom();
    this.addShips();
  }

  private handleMessages(message: string) {
    console.log("sending message", JSON.parse(message));

    const data = JSON.parse(message);
    const {type, data: messageData} = data;
    const dataObj = JSON.parse(messageData);

    switch (type) {
      case MessageType.REG: {
        this.indexPlayer = dataObj.index;
        break;
      }
      case MessageType.CREATE_GAME: {
        this.idGame = dataObj.id;
        break;
      }
      case MessageType.ATTACK: {
        return this.handleAttack(dataObj);
      }
      case MessageType.TURN: {
        return this.handleTurn(dataObj);
      }
    }
  }

  handleAttack(data: unknown) {
    console.log("bot attack", data);
  }

  handleTurn(data: { currentPlayer: string }) {
    if (data.currentPlayer === this.indexPlayer) {
      this.controller.handleMessage({
        id: '0',
        type: MessageType.RANDOM_ATTACK,
        data: JSON.stringify({
          gameId: this.idGame,
          indexPlayer: this.indexPlayer
        })
      })
    }
  }

  private initBotUser() {
    const bot = this.controller = new ConnectionController(this.handleMessages.bind(this));
    bot.handleMessage({
      id: '0',
      type: MessageType.REG,
      data: JSON.stringify({name: this.name, password: "123"})
    })
  }

  private addToRoom() {
    this.controller.handleMessage({
      id: '0',
      type: MessageType.ADD_TO_ROOM,
      data: JSON.stringify({indexRoom: this.room.roomID})
    })
  }

  private addShips() {
    const ships = this.generateShipsData();

    const data = {
      gameID: this.idGame,
      ships,
      indexPlayer: this.indexPlayer
    }

    this.controller.handleMessage({
      id: '0',
      type: MessageType.ADD_SHIPS,
      data: JSON.stringify(data)
    })
  }

  private generateShipsData(): ShipParams[] {
    const ships = SHIPS_TEMPLATE.map((ship) => {
      const type = ship.type as ShipType;
      const length = ship.length;
      const {position, direction} = this.getNextShipFromField(ship.length);
      return {position, direction, length, type}
    });

    this.ships = ships;

    return ships
  }

  private getNextShipFromField(length: number): { position: { x: number, y: number }, direction: boolean } {
    const {field} = this;

    let x = 0;
    let y = 0;
    let direction = true;
    let isPositionFound = false;

    while (!isPositionFound) {
      x = Math.floor(Math.random() * 10);
      y = Math.floor(Math.random() * 10);
      direction = Math.random() > 0.5;

      if (direction) {
        if (x + length < 10) {
          for (let i = 0; i < length; i++) {
            if (field[x + i]?.[y] !== FIELD_STATE.EMPTY) {
              break;
            }
          }
          isPositionFound = true;
        }
      } else {
        if (y + length < 10) {
          for (let i = 0; i < length; i++) {
            if (field[x + i]?.[y] !== FIELD_STATE.EMPTY) {
              break;
            }
          }
          isPositionFound = true;
        }
      }
    }

    return {position: {x, y}, direction};
  }
}

const SHIPS_TEMPLATE = [
  {
    length: 4,
    type: "huge"
  },
  {
    length: 3,
    type: "large"
  },
  {
    length: 3,
    type: "large"
  },
  {
    length: 2,
    type: "medium"
  },
  {
    length: 2,
    type: "medium"
  },
  {
    length: 2,
    type: "medium"
  },
  {
    length: 1,
    type: "small"
  },
  {
    length: 1,
    type: "small"
  },
  {
    length: 1,
    type: "small"
  },
  {
    length: 1,
    type: "small"
  }
]
