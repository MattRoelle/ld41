let ID = 0;

const BOUNDS = [
	[	[101, 0], [100, 1200] ],
	[	[701, 0], [700, 1200] ]
];

function castLineOnField(sx, sy, fx, fy) {
	const ret = [];

	let intersection = null;
	let bi = null;
	let intersectedBound = null;
	let i = 0;
	for(let b of BOUNDS) {
		const li = line_intersect(sx, sy, fx, fy, b[0][0], b[0][1], b[1][0], b[1][1]);
		if (li != null && li.seg1 && li.seg2 && intersection == null) {
			intersectedBound = b;
			intersection = li;
			bi = i;
		}
		i++;
	}

	if (intersection != null) {
		const distance = game.utils.dist(sx, sy, intersection.x, intersection.y);
		const idistance = game.utils.dist(sx, sy, fx, fy);
		const rdistance = idistance - distance;

		ret.push({x: intersection.x, y: intersection.y, t: (distance/idistance) });

		const rise = intersection.y - sy;


		const bb = intersectedBound;
		let theta;

		if (bi == 0) {
			theta = line_angle(
				sx, sy,
				fx, fy,
				bb[0][0], bb[0][1],
				bb[1][0], bb[1][1],
			);
			if (rise < 0) theta -= Math.PI/2;
			else theta = (theta*-1) + Math.PI/2;
		} else if (bi == 1) {
			theta = line_angle(
				sx, sy,
				fx, fy,
				bb[0][0], bb[0][1],
				bb[1][0], bb[1][1],
			);
			theta *= -1;

			if (rise < 0) theta -= Math.PI/2;
			else theta = (theta*-1) + Math.PI/2;
		}

		ret.push({
			x: intersection.x + (rdistance*Math.cos(theta)),
			y: intersection.y + (rdistance*Math.sin(theta)),
			t: (rdistance/idistance)
		});
	} else {
		ret.push({ x: fx, y: fy, t: 1 });
	}

	return ret;
}

class HockeyGame {
	constructor() {
		this.teams = [
			new AIHockeyTeam(TEAM_COLORS.blue, TEAM_SIDE.top, this),
			//new ControlledHockeyTeam(TEAM_COLORS.blue, TEAM_SIDE.top),
			new ControlledHockeyTeam(TEAM_COLORS.red, TEAM_SIDE.bottom, this)
		];

		this.puck = new HockeyPuck(400, 800);

		this.executingTurn = false;
		this.processingFight = false;
		this.turnEvents = [];
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

		for(let t of this.teams) {
			t.executeTurn();
			for(let p of t.players) {
				if (p.collidingWithPuck) {
					this.puck.moveTo(p.pendingMovement, C.TURN_SPEED);
					this.puck.touchedLast = p.id;
					p.collidingWithPuck = false;
				} else {
					p.moveTo(p.pendingMovement, C.TURN_SPEED);
				}
			}
		}

		const _this = this;
		setTimeout(() => {
			let fightOccured = false;
			let puckOccured = false;
			_this.executingTurn = false;

			for(let t of _this.teams) {
				for(let p of t.players) {
					if (p.collidingWthPuck) {
					}

					if (p.collidingWith.length > 0) {
						fightOccured = true;
						_this.processFight(p);
					}
				}
			}

			let delay = 0;

			if (fightOccured) {
				delay += C.FIGHT_SPEED;
				_this.processingFight = true;
			}

			setTimeout(() => {
				for(let t of _this.teams) {
					for(let p of t.players) {
						p.reset();
					}
				}
				_this.puck.touchedLast = -1;
				_this.processingFight = false
			}, delay);

		}, C.TURN_SPEED);
	}

	processFight(p) {
		const playersInFight = [];
		this.walkFightList(p, playersInFight);

		const winnerIdx = Math.floor(Math.random()*playersInFight.length);
		for(let i = 0; i < playersInFight.length; i++) {
			const p = playersInFight[i];
			if (i != winnerIdx) {
				var angle = Math.random()*Math.PI*2;
				var mag = (Math.random()*C.FIGHT_KNOCKBACK) + C.FIGHT_MIN_KNOCKBACK;

				const newPosition = {
					x: p.sprite.position.x + Math.cos(angle)*mag,
					y: p.sprite.position.y + Math.sin(angle)*mag
				};

				p.movementCancelled = false;
				p.collidingWithPuck = false;
				p.moveTo(newPosition, C.FIGHT_SPEED);
			} else {
				this.puck.touchedLast = p.id;
			}
		}

		for(let p of playersInFight) p.fightProcessed = true;
	}

	walkFightList(p, list) {
		if (p.fightProcessed || !!list.find(f => f.id == p.id)) return;
		list.push(p);
		for(let p2 of p.collidingWith) this.walkFightList(p2, list);
	}

	update() {
		for(let t of this.teams) t.update();

		if (this.executingTurn) {

			// @PLAYERCOLLISIONS
			const allPlayers = this.teams[0].players.concat(this.teams[1].players);
			for(let i = 0; i < allPlayers.length; i++) {
				const p1 = allPlayers[i];
				for(let j = 0; j < allPlayers.length; j++) {
					if (i != j) {
						const p2 = allPlayers[j];
						const distance = Math.sqrt(Math.pow(p2.sprite.position.x - p1.sprite.position.x, 2) + Math.pow(p2.sprite.position.y - p1.sprite.position.y, 2));

						if (distance < C.PLAYER_COLLISION_RADIUS) {
							p1.cancelMovement();
							p2.cancelMovement();

							if (!p1.collidingWith.find(p => p.id == p2.id)) p1.collidingWith.push(p2);
							if (!p2.collidingWith.find(p => p.id == p1.id)) p2.collidingWith.push(p1);
						}
					}

				}
				// @PUCKCOLLISIONS
				if (!p1.collidingWithPuck && this.puck.touchedLast != p1.id) {
					const distance = Math.sqrt(Math.pow(p1.sprite.position.x - this.puck.sprite.position.x, 2) + Math.pow(p1.sprite.position.y - this.puck.sprite.position.y, 2));

					if (distance < C.PUCK_COLLISION_RADIUS) {
						p1.cancelMovement();
						p1.collidingWithPuck = true;
						this.puck.touchedLast = p1.id;
						this.puck.cancelMovement();
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
	constructor(color, side, hgame) {
		this.color = color;
		this.position = side;
		this.hgame = hgame;

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
	
	render() {
		for(let p of this.players) p.render();
	}

	update() {}
}

class AIHockeyTeam extends HockeyTeam {
	constructor(color, side, hgame) { super(color, side, hgame); }

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
	constructor(color, side, hgame) {
		super(color, side, hgame);

		this.selectingMovement = false;
		this.selectingShot = false;
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
			this.playerTarget.pendingMovement = this.limitTarget({
				x: game.phaser.input.x + game.phaser.camera.x,
				y: game.phaser.input.y + game.phaser.camera.y
			}, this.playerTarget.sprite);
			this.selectingMovement = false;
		}
	}

	render() {
		super.render();

		this.ui.selectingLine.clear();
		if (!this.hgame.executingTurn && !this.hgame.processingFight) {
			if (this.selectingMovement) {
				const range = this.playerTarget.collidingWithPuck ? C.MAX_SHOT_RANGE : C.MAX_MOVEMENT;
				const targetPos = this.limitTarget({
					x: game.phaser.input.x + game.phaser.camera.x,
 	 	 			y: game.phaser.input.y + game.phaser.camera.y
				}, this.playerTarget.sprite, range);

				this.playerTarget.lookAt(targetPos);
				this.drawRangeCircle(this.playerTarget.sprite, range);
				this.drawPlayerLine(this.playerTarget.sprite,  targetPos);
			}

			for(let p of this.players) {
				if (!!p.pendingMovement) {
					this.drawPlayerLine(p.sprite, this.limitTarget(p.pendingMovement, p.sprite, p.collidingWithPuck ? C.MAX_SHOT_RANGE : C.MAX_MOVEMENT));
				}
			}
		}
	}

	limitTarget(targetPos, origin, upper) {
		const ret = { x: targetPos.x, y: targetPos.y };
		if (game.utils.dist(targetPos.x, targetPos.y, origin.x, origin.y) > upper) {
			const tx = targetPos.x, ty = targetPos.y, sx = origin.x, sy = origin.y;
			const theta = Math.atan2(ty - sy, tx - sx);

			ret.x = sx + Math.cos(theta)*upper;
			ret.y = sy + Math.sin(theta)*upper;
		}
		return ret;
	}

	drawRangeCircle(p, r) {
		this.ui.selectingLine.beginFill(0x00FF00, 0);
		this.ui.selectingLine.lineStyle(4, 0x1122F1, 0.5);
		this.ui.selectingLine.drawCircle(p.x, p.y, r*2);
		this.ui.selectingLine.endFill();
	}

	drawPlayerLine(p, target) {
		this.ui.selectingLine.beginFill(0xFF0000, 0);
		this.ui.selectingLine.lineStyle(10, 0xFF0000, 0.2);

		this.ui.selectingLine.moveTo(p.x, p.y);

		const points = castLineOnField(
			p.x,
			p.y,
			target.x,
			target.y
		);

		this.ui.selectingLine.endFill();
		
		this.ui.selectingLine.lineTo(points[0].x, points[0].y);
		if (points.length > 1) {
			this.ui.selectingLine.beginFill(0xFF0000, 0);
			this.ui.selectingLine.lineStyle(10, 0xFF0000, 0.2);
			this.ui.selectingLine.moveTo(points[0].x, points[0].y);
			this.ui.selectingLine.lineTo(points[1].x, points[1].y);
			this.ui.selectingLne.endFill();
		}
	}
}

class Movable {
	moveTo(position, duration) {
		this.movementCancelled = false;

		const sx = this.sprite.position.x;
		const sy = this.sprite.position.y;
		const fx = position.x;
		const fy = position.y;

		const points = castLineOnField(sx, sy, fx, fy);

		// only supporting 1 bounce b/c lazy
		this.lookAt(points[0]);

		const ease1 = points.length > 1 ? Phaser.Easing.Quadratic.In :Phaser.Easing.Quadratic.InOut;

		this.activeTween = game.phaser.add.tween(this.sprite.position).to(points[0], points[0].t*C.TURN_SPEED, ease1, true);
		if (points.length > 1) {
			this.activeTween.onComplete.add(() => {
				this.lookAt(points[1]);
				if (this.movementCancelled) return;
				this.activeTween = game.phaser.add.tween(this.sprite.position).to(points[1], points[1].t*C.TURN_SPEED, Phaser.Easing.Quadratic.Out, true);
			});
		}
	}

	lookAt(position) {
		const theta = Math.atan2(this.sprite.position.y - position.y, this.sprite.position.x - position.x);
		this.sprite.angle = (theta*180/Math.PI) - 90;
	}

	cancelMovement() {
		this.movementCancelled = true;
		if (!!this.activeTween) this.activeTween.stop();
	}
}

class HockeyPuck extends Movable {
	constructor(x, y) {
		super();
		this.sprite = game.phaser.add.sprite(x, y, "puck");
		this.sprite.anchor.set(0.5);
		this.sprite.pivot.set(0.5);
		this.touchedLast = -1;
	}
}

class HockeyPlayer extends Movable {
	constructor(ordinal, color, side) {
		super();

		this.id = ++ID;
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

		this.reset();
		this.collidingWithPuck = false;
	}

	reset() {
		this.pendingMovement = null;
		this.collidingWith = [];
		this.fightProcessed = false;
		this.movementCancelled = false;
	}

	render() {
		this.sprite.bringToTop();
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
