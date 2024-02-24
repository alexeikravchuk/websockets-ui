import { WebSocketServer, WebSocket } from "ws";
import ConnectionController from "../controllers/ConnectionController";
import { UserMessage } from '../types';

export const wss: WebSocketServer = new WebSocketServer({port: 3000});

wss.on("connection", (ws: WebSocket) => {
  const user: ConnectionController = new ConnectionController(ws.send.bind(ws));
  ws.on("error", (err: Error) => console.error(err));

  ws.on("message", function message(data: string | Buffer) {
    try {
      const message = JSON.parse(data.toString()) as UserMessage;
      user.handleMessage(message);
    } catch (e) {
      console.error(e);
    }
  });

  ws.on("close", () => user.handleClose());
});
