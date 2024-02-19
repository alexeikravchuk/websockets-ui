const games = new Map();

class Game {
	static get(gameName) {
		if (!games.has(gameName)) {
			games.set(gameName, new Game(gameName));
		}

		return games.get(gameName);
	}

	constructor(gameName) {
		this.name = gameName;
		this.members = new Set();
	}

	join(member) {
		this.members.add(member);
	}

	leave(member) {
		this.members.delete(member);
	}

	broadcast(data) {
		for (let member of this.members) {
			member.send(JSON.stringify(data));
		}
	}

	getMembers() {
		return this.members;
	}

	getMember(name) {
		for (let member of this.members) {
			if (member.name === name) return member;
		}
	}
}

export default Game;
