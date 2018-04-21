class HockeyGame {
	constructor() {
		this.teams = [
			new AIHockeyTeam(TEAM_COLORS.blue, TEAM_SIDE.top),
			new ControlledHockeyTeam(TEAM_COLORS.red, TEAM_SIDE.bottom)
		];

		this.puck = game.phaser.add.sprite(400, 600, "puck");
		this.puck.anchor.set(0.5);
		this.puck.pivot.set(0.5);

		this.executingTurn = false;
	}

	executeTurn() {
		if (this.executingTurn) return;
		this.executingTurn = true;

		for(let t of this.teams) {
			t.preExecuteTurn();
			for(let p of t.players) {
				if (!p.pendingMovement) {
					this.executingTurn = false;
					return;
				}
			}
		}

		const tweens = [];

		for(let t of this.teams) {
			t.executeTurn();
			for(let p of t.players) {
				tweens.push(
					game.phaser.add.tween(p.sprite.position).to(p.pendingMovement, C.TURN_SPEED, Phaser.Easing.Quadratic.InOut, true)
				);
			}
		}

		const _this = this;
		setTimeout(() => {
			_this.executingTurn = false;
			for(let t of _this.teams) {
				for(let p of t.players) {
					p.pendingMovement = null;
				}
			}
		}, C.TURN_SPEED);
	}

	update() {
		for(let t of this.teams) t.update();

		if (this.executingTurn) {

			// @PLAYERCOLLISIONS
			for(let p1 of this.teams[0].players) {
				for(let p2 of this.teams[1].players) {
					const distance = Math.sqrt(Math.pow(p2.sprite.position.x - p1.sprite.position.x, 2) + Math.pow(p2.sprite.position.y - p1.sprite.position.y, 2));

					if (distance < C.PLAYER_COLLISION_RADIUS) {
						console.log("player collision");
					}
				}
			}

			// @PUCKCOLLISIONS
			for(let t of this.teams) {
				for(let p of t.players) {
					const distance = Math.sqrt(Math.pow(p.sprite.position.x - this.puck.position.x, 2) + Math.pow(p.sprite.position.y - this.puck.position.y, 2));

					if (distance < C.PUCK_COLLISION_RADIUS) {
						console.log("puck collision");
					}
				}
			}
		}
	}

	render() {
		for(let t of this.teams) t.render();
	}
}

const TEAM_COLORS = {
	red: 0,
	blue: 1
};

const TEAM_SIDE = {
	top: 0,
	bottom: 1
};

class HockeyTeam {
	constructor(color, side) {
		this.color = color;
		this.position = side;

		this.players = [
			new HockeyPlayer(0, color, side),
			new HockeyPlayer(1, color, side),
			new HockeyPlayer(2, color, side),
		];
	}

	preExecuteTurn() {

	}

	executeTurn() {
	}
	
	render() {}
	update() {}
}

class AIHockeyTeam extends HockeyTeam {
	constructor(color, side) { super(color, side); }

	preExecuteTurn() {
		for(let p of this.players) {
			p.pendingMovement = {
				x: p.sprite.x,
				y: p.sprite.y + 100
			};
		}
	}
}

class ControlledHockeyTeam extends HockeyTeam {
	constructor(color, side) {
		super(color, side);

		this.selectingMovement = false;
		this.playerTarget = null;

		this.ui = {};
		this.ui.selectingLine = game.phaser.add.graphics();

		for(let p of this.players) {
			p.sprite.inputEnabled = true;
			p.sprite.events.onInputDown.add(() => {
				if (!this.selectingMovement) {
					p.pendingMovement = null;
					this.selectingMovement = true;
					this.playerTarget = p;
				}
			}, p);
		}

		game.phaser.input.onDown.add(this.onMouseDown, this);
	}

	update() {
	}

	onMouseDown() {
		if (this.selectingMovement) {
			this.playerTarget.pendingMovement = {
				x: game.phaser.input.x + game.phaser.camera.x,
				y: game.phaser.input.y + game.phaser.camera.y
			};
			this.selectingMovement = false;
		}
	}

	render() {
		this.ui.selectingLine.clear();

		if (this.selectingMovement) {
			this.ui.selectingLine.beginFill(0xFF0000);
			this.ui.selectingLine.lineStyle(10, 0xFF0000, 1);
			this.ui.selectingLine.moveTo(this.playerTarget.sprite.x, this.playerTarget.sprite.y);
			this.ui.selectingLine.lineTo(game.phaser.input.x + game.phaser.camera.x, game.phaser.input.y + game.phaser.camera.y);
			this.ui.selectingLine.endFill();
		}

		for(let p of this.players) {
			if (!!p.pendingMovement) {
				this.ui.selectingLine.beginFill(0xFF0000);
				this.ui.selectingLine.lineStyle(10, 0xFF0000, 1);
				this.ui.selectingLine.moveTo(p.sprite.x, p.sprite.y);
				this.ui.selectingLine.lineTo(p.pendingMovement.x, p.pendingMovement.y);
				this.ui.selectingLine.endFill();
			}
		}
	}
}

class HockeyPlayer {
	constructor(ordinal, color, side) {
		let x = 200 + (ordinal*200);

		this.ordinal = ordinal;

		let y;
		if (side == TEAM_SIDE.top) {
			y = 250;
			if (ordinal != 1) y += 50;
		} else {
			y = 950;
			if (ordinal != 1) y -= 50;
		}

		this.sprite = game.phaser.add.sprite(x, y, color == TEAM_COLORS.red ? "red-player" : "blue-player");
		this.sprite.anchor.set(0.5);
		this.sprite.pivot.set(0.5);
		this.sprite.bringToTop();

		this.pendingMovement = null;
	}

	destroy() {
		this.sprite.destroy();
	}
}

class PlayController {
	constructor(params) {
		this.destroyables = [];
		this.destroyables.push(game.phaser.add.sprite(0, 0, "rink"));
		game.phaser.world.setBounds(0, 0, 800, 1200);
		game.phaser.camera.y = 600;

		this.hockeyGame = new HockeyGame();

		this.submitBtn = game.phaser.add.sprite(650, 200, "submit-btn");
		this.submitBtn.anchor.set(0.5);
		this.submitBtn.fixedToCamera = true;
		this.submitBtn.inputEnabled = true;
		this.submitBtn.events.onInputDown.add(() => {
			console.log("submit btn pressed");
			this.hockeyGame.executeTurn();
		}, this);
	}

	update() {
		this.hockeyGame.update();
		if (game.input.up()) game.phaser.camera.y -= 14;
		else if (game.input.down()) game.phaser.camera.y += 10;
	}

	render() {
		this.hockeyGame.render();
	}

	destroy() {
		for(let d of this.destroyables) d.destroy();
	}
}
