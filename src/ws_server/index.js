import { WebSocketServer } from "ws";
import User from "../User.js";

export const wss = new WebSocketServer({ port: 3000 });

wss.on("connection", function connection(ws) {
	const user = new User(ws.send.bind(ws));
	ws.on("error", console.error);

	ws.on("message", function message(data) {
		try {
			user.handleMessage(data.toString());
		} catch (e) {
			console.error(e);
		}
	});
});
