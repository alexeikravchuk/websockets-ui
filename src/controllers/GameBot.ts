import Room from '../models/Room';
import ConnectionController from './ConnectionController';

import { getUUID } from '../utils/getUUID';
import { getEmptyField } from '../utils/getEmptyField';
import { FIELD_STATE, MessageType, ShipParams, ShipType } from '../types';
import * as console from 'console';

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

    this.delayCall(this.addToRoom.bind(this), 200);
    this.delayCall(this.addShips.bind(this), 200);
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
        return this.delayCall(() => this.handleTurn(dataObj), 200);
      }
    }
  }

  handleAttack(data: { status: FIELD_STATE, position: { x: number, y: number }, currentPlayer: string }) {
    if (data.currentPlayer !== this.indexPlayer) {
      const {x, y} = data.position;
      const row = this.field[x];
      if (!row) return;

      row[y] = data.status as FIELD_STATE;

      console.log("Enemy attack", data.status, data.position);
    } else {
      console.log("Bot attack", data.status, data.position);
    }
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
    let ships = SHIPS_TEMPLATE.map((ship) => {
      const type = ship.type as ShipType;
      const length = ship.length;
      const {position, direction} = this.getNextShipFromField(ship.length);
      return {position, direction, length, type}
    });

    // @ts-ignore
    ships = fields[Math.random() * fields.length >> 0]

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

    this.fillField({position: {x, y}, direction, length})


    return {position: {x, y}, direction};
  }


  private fillField(ship: {
    direction: boolean;
    length: number;
    position: { x: number, y: number }
  }) {
    const {position, direction, length} = ship;
    const {x, y} = position;
    const {field} = this;

    if (direction) { // vertical
      for (let i = 0; i < length; i++) {
        field[x + i]![y] = FIELD_STATE.SHIP;
      }
    } else {
      for (let i = 0; i < length; i++) {
        field[x]![y + i] = FIELD_STATE.SHIP;
      }
    }
  }

  private delayCall(callback: () => void, delay: number) {
    setTimeout(callback, delay);
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

const fields: ShipParams[][] = [
  [{position: {x: 7, y: 5}, direction: true, type: "huge", length: 4}, {
    position: {x: 0, y: 2},
    direction: false,
    type: "large",
    length: 3
  }, {position: {x: 8, y: 0}, direction: true, type: "large", length: 3}, {
    position: {x: 2, y: 7},
    direction: false,
    type: "medium",
    length: 2
  }, {position: {x: 4, y: 2}, direction: true, type: "medium", length: 2}, {
    position: {x: 0, y: 4},
    direction: false,
    type: "medium",
    length: 2
  }, {position: {x: 5, y: 0}, direction: true, type: "small", length: 1}, {
    position: {x: 6, y: 2},
    direction: true,
    type: "small",
    length: 1
  }, {position: {x: 0, y: 6}, direction: false, type: "small", length: 1}, {
    position: {x: 9, y: 4},
    direction: false,
    type: "small",
    length: 1
  }],
  [{position: {x: 2, y: 0}, direction: false, type: "huge", length: 4}, {
    position: {x: 0, y: 4},
    direction: true,
    type: "large",
    length: 3
  }, {position: {x: 2, y: 2}, direction: true, type: "large", length: 3}, {
    position: {x: 3, y: 6},
    direction: false,
    type: "medium",
    length: 2
  }, {position: {x: 7, y: 6}, direction: false, type: "medium", length: 2}, {
    position: {x: 4, y: 3},
    direction: false,
    type: "medium",
    length: 2
  }, {position: {x: 0, y: 2}, direction: false, type: "small", length: 1}, {
    position: {x: 1, y: 8},
    direction: true,
    type: "small",
    length: 1
  }, {position: {x: 3, y: 8}, direction: true, type: "small", length: 1}, {
    position: {x: 8, y: 8},
    direction: false,
    type: "small",
    length: 1
  }],
  [{direction: true, length: 4, position: {x: 4, y: 5}, type: "huge"}, {
    direction: true,
    length: 3,
    position: {x: 3, y: 0},
    type: "large"
  }, {direction: false, length: 3, position: {x: 0, y: 4}, type: "large"}, {
    direction: false,
    length: 2,
    position: {x: 0, y: 8},
    type: "medium"
  }, {direction: true, length: 2, position: {x: 9, y: 2}, type: "medium"}, {
    direction: false,
    length: 2,
    position: {x: 0, y: 2},
    type: "medium"
  }, {direction: false, length: 1, position: {x: 5, y: 1}, type: "small"}, {
    direction: false,
    length: 1,
    position: {x: 1, y: 6},
    type: "small"
  }, {direction: true, length: 1, position: {x: 8, y: 0}, type: "small"}, {
    direction: true,
    length: 1,
    position: {x: 6, y: 7},
    type: "small"
  }],
  [{direction: true, length: 4, position: {x: 5, y: 2}, type: "huge"}, {
    direction: false,
    length: 3,
    position: {x: 0, y: 5},
    type: "large"
  }, {direction: true, length: 3, position: {x: 4, y: 7}, type: "large"}, {
    direction: true,
    length: 2,
    position: {x: 8, y: 1},
    type: "medium"
  }, {direction: true, length: 2, position: {x: 8, y: 4}, type: "medium"}, {
    direction: true,
    length: 2,
    position: {x: 3, y: 1},
    type: "medium"
  }, {direction: true, length: 1, position: {x: 1, y: 1}, type: "small"}, {
    direction: true,
    length: 1,
    position: {x: 2, y: 8},
    type: "small"
  }, {direction: false, length: 1, position: {x: 0, y: 7}, type: "small"}, {
    direction: true,
    length: 1,
    position: {x: 5, y: 0},
    type: "small"
  }]
]