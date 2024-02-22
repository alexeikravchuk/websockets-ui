import { WebSocketServer, WebSocket } from "ws";
import UserController from "../controllers/UserController";
import { UserMessage } from '../types';

export const wss: WebSocketServer = new WebSocketServer({port: 3000});

wss.on("connection", (ws: WebSocket) => {
  const user: UserController = new UserController(ws.send.bind(ws));
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
