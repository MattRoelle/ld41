class HockeyGame {
	constructor(opts) {
		this.opts = opts;
		this.teams = [
			new AIHockeyTeam(TEAM_COLORS.red, TEAM_SIDE.top, this),
			//new ControlledHockeyTeam(TEAM_COLORS.red, TEAM_SIDE.top, this),
			new ControlledHockeyTeam(TEAM_COLORS.blue, TEAM_SIDE.bottom, this)
		];

		this.bounds = [];
		for(let b of BOUNDS) {
			const s = game.phaser.add.sprite(b.x, b.y, null);
			game.phaser.physics.enable([s], Phaser.Physics.ARCADE);
			s.body.setSize(b.w, b.h);
			s.body.immovable = true;
			s.body.moves = false;
			this.bounds.push(s);
		}

		this.puck = new HockeyPuck(400, 700);

		this.executingTurn = false;
		this.processingFight = false;
		this.turnEvents = [];
		this.nFights = 0;
	}

	destroy() {
		this.destroyed = true;
		this.puck.destroy();
		for(let b of this.bounds) b.destroy();
		for(let t of this.teams) {
			t.destroy();
		}
	}

	executeTurn() {
		if (this.executingTurn) return;
		this.executingTurn = true;

		this.tstart = game.phaser.time.now;

		for(let t of this.teams) t.preExecuteTurn();

		for(let t of this.teams) {
			t.executeTurn();
			for(let p of t.players) {
				if (p.collidingWithPuck) {
					if (!!p.pendingMovement) {
						if (!!this.puckTween) this.puckTween.stop();
						this.puck.sprite.position.x = p.sprite.position.x;
						this.puck.sprite.position.y = p.sprite.position.y;
						this.puck.moveTo(p.pendingMovement, C.TURN_SPEED);
						this.puck.touchedLast = p.id;
						p.collidingWithPuck = false;
					}
					game.phaser.add.tween(p.shootRing.scale).to({x: 0, y: 0}, 1000, Phaser.Easing.Quadratic.InOut, true);
				} else {
					if (!!p.pendingMovement) {
						p.moveTo(p.pendingMovement, C.TURN_SPEED);
					}
				}
			}
		}
	}

	endTurn() {
		const _this = this;


		for(let t of _this.teams) {
			for(let p of t.players) {
				p.inFight = false;
				p.collidingWith = [];
			}
		}

		this.checkEvents(true);

		let fightOccured = false;

		for(let t of this.teams) {
			for(let p of t.players) {
				if (p.collidingWith.length > 0) {
					fightOccured = true;
					this.processFight(p);
				}
			}
		}

		if (fightOccured) return;

		for(let t of this.teams) {
			for(let p of t.players) {
				if (p.collidingWithPuck) {
					game.phaser.add.tween(p.shootRing.scale).to({x: 1, y: 1}, 1000, Phaser.Easing.Quadratic.InOut, true);
					this.puckTween = game.phaser.add.tween(this.puck.sprite.position).to(p.sprite.position, 800, Phaser.Easing.Quadratic.InOut, true);
				}
				p.reset();
			}
		}

		_this.executingTurn = false;
		_this.puck.touchedLast = -1;
		_this.processingFight = false
	}

	processFight(p) {
		const playersInFight = [];
		this.walkFightList(p, playersInFight);

		if (playersInFight.length > 1) {
			this.nFights++;
			game.effects.fightAnim(playersInFight[0].sprite.x, playersInFight[0].sprite.y);

			setTimeout(() => {
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

						p.moveTo(newPosition, C.FIGHT_SPEED, true);

						setTimeout(() => {
							p.collidingWith = [];
							p.inFight = false;
						}, 250);
					}
				}

				const _this = this;
				setTimeout(() => {
					_this.nFights--;
				}, 150);

				const winp = playersInFight[winnerIdx];
				if (anyTouchPuck || winp.collidingWithPuck) {
					this.puck.touchedLast = winp.id;
				}

				setTimeout(() => {
					winp.collidingWith = [];
					winp.inFight = false;
				}, 250);
			}, C.PREFIGHT_SPEED);
		}
	}

	walkFightList(p, list) {
		if (!!list.find(f => f.id == p.id) || p.inFight) return;
		p.inFight = true;
		list.push(p);
		for(let p2 of p.collidingWith) this.walkFightList(p2, list);
	}

	checkEvents(forceCollisions) {
		// @PLAYERCOLLISIONS
		const allPlayers = this.teams[0].players.concat(this.teams[1].players);
		for(let i = 0; i < allPlayers.length; i++) {
			const p1 = allPlayers[i];
			for(let j = 0; j < allPlayers.length; j++) {
				if (i != j) {
					const p2 = allPlayers[j];
					const distance = Math.sqrt(Math.pow(p2.sprite.position.x - p1.sprite.position.x, 2) + Math.pow(p2.sprite.position.y - p1.sprite.position.y, 2));

					if ((distance < C.PLAYER_COLLISION_RADIUS) || (p1.collidingWithPuck && p2.collidingWithPuck)) {
						if (!p1.inFight) p1.cancelMovement();
						if (!p2.inFight) p2.cancelMovement();

						let anyCollision = false;

						if (!p1.collidingWith.find(p => p.id == p2.id)) { p1.collidingWith.push(p2); anyCollision = true; }
						if (!p2.collidingWith.find(p => p.id == p1.id)) { p2.collidingWith.push(p1); anyCollision = true; }

						if (anyCollision) {
							//game.effects.fightRing(p1.sprite.position.x, p1.sprite.position.y);
						}
					}
				}
			}

			// @PUCKCOLLISIONS
			if ((forceCollisions || !p1.inFight) && !p1.collidingWithPuck && this.puck.touchedLast != p1.id) {
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
		if (this.puck.sprite.body.velocity.getMagnitude() < 2) {
			if (game.utils.dist(this.puck.sprite.position.x, this.puck.sprite.position.y, GOAL_1.x, GOAL_1.y) < C.GOAL_RADIUS) {
				// blue team scores
				this.opts.onScore(TEAM_COLORS.red);
			} else if (game.utils.dist(this.puck.sprite.position.x, this.puck.sprite.position.y, GOAL_2.x, GOAL_2.y) < C.GOAL_RADIUS) {
				// red team scores
				this.opts.onScore(TEAM_COLORS.blue);
			}
		}
	}

	update() {
		const _this = this;

		for(let t of this.teams) {
			for(let p of t.players) {
				for(let b of this.bounds) {
					game.phaser.physics.arcade.collide(p.sprite, b);
				}
			}
			t.update();
		}

		for(let b of this.bounds) {
			game.phaser.physics.arcade.collide(this.puck.sprite, b);
		}

		if (this.executingTurn) {
			this.checkEvents();
			if (this.destroyed) return;

			let fightOccured = false;

			let allVelocityDone = true;

			for(let t of this.teams) {
				for(let p of t.players) {
					if (p.sprite.body.velocity.getMagnitude() > 1) allVelocityDone = false;
					if (p.collidingWith.length > 0) {
						fightOccured = true;
						this.processFight(p);
					}
				}
			}

			allVelocityDone = allVelocityDone && (Math.abs(this.puck.sprite.body.velocity.getMagnitude()) < 1);

			
			const plyrsPucking = [];
			for(let t of _this.teams) {
				for(let p of t.players) {
					if (p.collidingWithPuck) {
						plyrsPucking.push(p);
					}
				}
			}

			if (plyrsPucking.length >= 2) {
				for(let p of plyrsPucking) { p.collidingWith = []; }
				for(let i = 1; i < plyrsPucking.length; i++) {
					plyrsPucking[0].collidingWith.push(plyrsPucking[i]);
				}
				this.processFight(plyrsPucking[0]);
			}

			if (allVelocityDone && (game.phaser.time.now - this.tstart > 300) && this.nFights == 0) {
				this.endTurn();
			}

		}
	}

	render() {
		if (!!this.bounds && DEBUG) {
			for(let b of this.bounds) game.phaser.debug.body(b);
		}
		for(let t of this.teams) t.render();
		this.puck.render();
	}
}
