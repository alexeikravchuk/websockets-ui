import Game from "./Game.js";
import db from "./db/db.ts";

class User {
	constructor(send) {
		this._send = send; // "send" function for this user
		this.name = null; // becomes the username of the visitor
	}

	send(data) {
		try {
			this._send(data);
		} catch {
			// If trying to send to a user fails, ignore it
		}
	}

	handleJoin(name) {
		this.name = name;
		this.room.join(this);
		this.room.broadcast({
			type: "note",
			text: `${this.name} joined "${this.room.name}".`,
		});
	}

	handleChat(text) {
		this.room.broadcast({
			name: this.name,
			type: "chat",
			text: text,
		});
	}

	handlePrivateChat(recipient, text) {
		const member = this.room.getMember(recipient);

		member.send(
			JSON.stringify({
				name: this.name,
				type: "priv-chat",
				text: text,
			})
		);
	}

	handleMessage(jsonData) {
		const msg = JSON.parse(jsonData);
		const id = msg.id;
		const data = JSON.parse(msg.data);

		switch (msg.type) {
			case "reg":
				return this.reqisterUser(data, id);
			case "create_game":
				return this.createGame(data);
			case "start_game":
				return this.startGame(data);
			default:
				throw new Error(`bad message: ${msg.type}`);
		}
	}

	/** Connection was closed: leave game, announce exit to others. */

	handleClose() {
		this.room.leave(this);
		this.room.broadcast({
			type: "note",
			text: `${this.name} left ${this.room.name}.`,
		});
	}

	handleGetMembers() {
		const members = this.room.getMembers();
		const memberNames = [];

		for (let member of members) {
			memberNames.push(member.name);
		}

		this.send(
			JSON.stringify({
				name: "In room",
				type: "chat",
				text: memberNames.join(", "),
			})
		);
	}

	reqisterUser(data, id) {
		const userId = db.getCollection("users").length;

		const { password, name } = data;

		this.name = name;

		db.addValue("users", { name, password, id: userId });

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

		console.log("userId", userId);
		console.log("response", response);
		this.send(JSON.stringify(response));
	}

	createGame(data) {
		console.log("creating game", data);
	}

	startGame(data) {
		console.log("starting game", data);
	}
}

export default User;
