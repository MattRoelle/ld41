class HockeyGame {
	constructor(opts) {
		this.opts = opts;
		this.teams = [
			//new AIHockeyTeam(TEAM_COLORS.red, TEAM_SIDE.top, this),
			new ControlledHockeyTeam(TEAM_COLORS.red, TEAM_SIDE.top, this),
			new ControlledHockeyTeam(TEAM_COLORS.blue, TEAM_SIDE.bottom, this)
		];

		this.puck = new HockeyPuck(400, 800);

		this.executingTurn = false;
		this.processingFight = false;
		this.turnEvents = [];
	}

	destroy() {
		this.puck.destroy();
		for(let t of this.teams) {
			t.destroy();
		}
	}

	executeTurn() {
		if (this.executingTurn) return;
		this.executingTurn = true;

		/*
		for(let t of this.teams) {
			t.preExecuteTurn();
			for(let p of t.players) {
				if (!p.pendingMovement) {
					this.executingTurn = false;
					return;
				}
			}
		}
		*/

		for(let t of this.teams) {
			t.executeTurn();
			for(let p of t.players) {
				if (!!p.pendingMovement) {
					if (p.collidingWithPuck) {
						this.puck.moveTo(p.pendingMovement, C.TURN_SPEED);
						this.puck.touchedLast = p.id;
						p.collidingWithPuck = false;
						game.phaser.add.tween(p.shootRing.scale).to({x: 0, y: 0}, 1000, Phaser.Easing.Quadratic.InOut, true);
					} else {
						p.moveTo(p.pendingMovement, C.TURN_SPEED);
					}
				}
			}
		}

		const _this = this;
		setTimeout(() => {
			_this.executingTurn = false;
			_this.postExecuteTurn();
		}, C.TURN_SPEED);
	}

	postExecuteTurn() {
		console.log("postexec");
		const _this = this;

		let fightOccured = false;
		let puckOccured = false;

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
			delay += C.FIGHT_SPEED + C.PREFIGHT_SPEED;
			_this.processingFight = true;
		}

		setTimeout(() => {
			for(let t of _this.teams) {
				for(let p of t.players) {
					if (p.collidingWithPuck) {
						game.phaser.add.tween(p.shootRing.scale).to({x: 1, y: 1}, 1000, Phaser.Easing.Quadratic.InOut, true);
					}
					p.reset();
				}
			}

			if (!fightOccured && !puckOccured) {
				_this.endTurn();
			} else {
				_this.checkEvents();
				_this.postExecuteTurn();
			}
		}, delay);
	}

	endTurn() {
		const _this = this;
		for(let t of _this.teams) {
			for(let p of t.players) {
				if (p.collidingWithPuck) {
					game.phaser.add.tween(p.shootRing.scale).to({x: 1, y: 1}, 1000, Phaser.Easing.Quadratic.InOut, true);
				}
				p.reset();
			}
		}
		_this.puck.touchedLast = -1;
		_this.processingFight = false
	}

	processFight(p) {
		const playersInFight = [];
		this.walkFightList(p, playersInFight);

		if (playersInFight.length > 0) {
			game.effects.fightAnim(playersInFight[0].sprite.x, playersInFight[0].sprite.y);

			let anyTouchPuck = false;
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
					if (p.collidingWithPuck) anyTouchPuck = true;
					p.collidingWithPuck = false;
					setTimeout(() => {
						p.moveTo(newPosition, C.FIGHT_SPEED, true);
					}, C.PREFIGHT_SPEED);
				}
			}

			const winp = playersInFight[winnerIdx];
			if (anyTouchPuck || winp.collidingWithPuck) {
				this.puck.touchedLast = winp.id;
				//this.puck.sprite.position.x = winp.sprite.position.x;
				//this.puck.sprite.position.y = winp.sprite.position.x;
			}

			for(let p of playersInFight) p.fightProcessed = true;
		}
	}

	walkFightList(p, list) {
		if (p.fightProcessed || !!list.find(f => f.id == p.id)) return;
		list.push(p);
		for(let p2 of p.collidingWith) this.walkFightList(p2, list);
	}

	checkEvents() {
		// @PLAYERCOLLISIONS
		const allPlayers = this.teams[0].players.concat(this.teams[1].players);
		for(let i = 0; i < allPlayers.length; i++) {
			const p1 = allPlayers[i];
			for(let j = 0; j < allPlayers.length; j++) {
				if (i != j) {
					const p2 = allPlayers[j];
					const distance = Math.sqrt(Math.pow(p2.sprite.position.x - p1.sprite.position.x, 2) + Math.pow(p2.sprite.position.y - p1.sprite.position.y, 2));

					if ((distance < C.PLAYER_COLLISION_RADIUS) || (p1.collidingWithPuck && p2.collidingWithPuck)) {
						p1.cancelMovement();
						p2.cancelMovement();

						let anyCollision = false;

						if (!p1.collidingWith.find(p => p.id == p2.id)) { p1.collidingWith.push(p2); anyCollision = true; }
						if (!p2.collidingWith.find(p => p.id == p1.id)) { p2.collidingWith.push(p1); anyCollision = true; }

						if (anyCollision) {
							game.effects.fightRing(p1.sprite.position.x, p1.sprite.position.y);
						}
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

		// @SCORING
		if (game.utils.dist(this.puck.sprite.position.x, this.puck.sprite.position.y, GOAL_1.x, GOAL_1.y) < C.GOAL_RADIUS) {
			// blue team scores
			this.opts.onScore(TEAM_COLORS.red);
		} else if (game.utils.dist(this.puck.sprite.position.x, this.puck.sprite.position.y, GOAL_2.x, GOAL_2.y) < C.GOAL_RADIUS) {
			// red team scores
			this.opts.onScore(TEAM_COLORS.blue);
		}
	}

	update() {
		for(let t of this.teams) t.update();

		if (this.executingTurn) {
			this.checkEvents();
		}
	}

	render() {
		for(let t of this.teams) t.render();
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

	destroy() {
		this.sprite.destroy();
	}
}

