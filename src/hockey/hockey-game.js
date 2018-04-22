class HockeyGame {
	constructor(opts) {
		this.opts = opts;

		if (opts.numPlayers == 1) {
			this.teams = [
				new AIHockeyTeam(TEAM_COLORS.red, TEAM_SIDE.top, this, 0),
				new ControlledHockeyTeam(TEAM_COLORS.blue, TEAM_SIDE.bottom, this, 1)
			];
		} else {
			this.teams = [
				new ControlledHockeyTeam(TEAM_COLORS.red, TEAM_SIDE.top, this, 0),
				new ControlledHockeyTeam(TEAM_COLORS.blue, TEAM_SIDE.bottom, this, 1)
			];
		}

		this.playerCollisionGroup = game.phaser.physics.p2.createCollisionGroup();
		this.puckCollisionGroup = game.phaser.physics.p2.createCollisionGroup();
		this.boundsCollisionGroup = game.phaser.physics.p2.createCollisionGroup();

		for(let t of this.teams) {
			for(let p of t.players) {
				p.sprite.body.setCollisionGroup(this.playerCollisionGroup);
			}
		}

		this.bounds = [];
		for(let b of BOUNDS) {
			const s = game.phaser.add.sprite(b.x, b.y, null);
			game.phaser.physics.enable([s], Phaser.Physics.P2JS);
			s.body.static = true;
			s.body.addRectangle(b.w, b.h);
			s.body.rotation = b.r;
			s.body.debug = DEBUG;
			s.body.setCollisionGroup(this.boundsCollisionGroup);
			this.bounds.push(s);
		}

		this.puck = new HockeyPuck(400, 700);
		this.puck.sprite.body.setCollisionGroup(this.puckCollisionGroup);

		this.puck.sprite.body.collides([ this.playerCollisionGroup, ], () => {
			game.audio.playSfx(SFX_TYPES.PUCK_HIT);
		}, this);

		this.puck.sprite.body.collides([ this.boundsCollisionGroup ], () => {
			game.audio.playSfx(SFX_TYPES.PUCK_WALL);
		}, this);

		for(let t of this.teams) {
			for(let p of t.players) {
				p.sprite.body.collides([ this.puckCollisionGroup, this.boundsCollisionGroup ]);
				p.sprite.body.collides([ this.playerCollisionGroup ], () => {
					game.audio.playSfx(SFX_TYPES.HIT1);
				}, this);
			}
		}

		for(let b of this.bounds) {
			b.body.collides([ this.puckCollisionGroup, this.playerCollisionGroup ]);
		}


		this.executingTurn = false;
		this.processingFight = false;
		this.turnEvents = [];
		this.nFights = 0;
		this.currentTeamsTurn = opts.startingTeam;
		this.scored = false;
		game.phaser.camera.unfollow();

		setTimeout(() => {
			if (this.opts.turnsRemaining > 0) {
				if (this.currentTeamsTurn == 1) {
					game.effects.announcement("BLUE TURN", "#0000ff");
					game.audio.playSfx(SFX_TYPES.BLUE_TURN);
				} else {
					game.effects.announcement("RED TURN", "#ff0000");
					game.audio.playSfx(SFX_TYPES.RED_TURN);
				}
			}
		}, 500);
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
		if (this.executingTurn || this.opts.turnsRemaining <= 0) return;
		this.executingTurn = true;

		this.tstart = game.phaser.time.now;

		game.phaser.camera.follow(this.puck.sprite, null, 0.075, 0.075);

		const t = this.teams[this.currentTeamsTurn];
		t.preExecuteTurn();
		t.executeTurn();

		for(let p of t.players) {
			if (!!p.pendingMovement) {
				p.moveTo(p.pendingMovement, C.TURN_SPEED);
			}
		}
	}

	endTurn() {
		const _this = this;

		game.phaser.camera.unfollow();

		for(let t of this.teams) {
			for(let p of t.players) {
				p.reset();
			}
		}

		this.puck.prev = null;

		_this.executingTurn = false;
		_this.processingFight = false
		_this.currentTeamsTurn = (_this.currentTeamsTurn + 1) % 2;
		_this.opts.turnsRemaining--;

		if (!this.scored && this.opts.turnsRemaining > 0) {
			if (_this.currentTeamsTurn == 1) {
				game.effects.announcement("BLUE TURN", "#0000ff");
					game.audio.playSfx(SFX_TYPES.BLUE_TURN);
			} else {
				game.effects.announcement("RED TURN", "#ff0000");
					game.audio.playSfx(SFX_TYPES.RED_TURN);
			}
		}
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

	checkEvents() {
		const allPlayers = this.teams[0].players.concat(this.teams[1].players);

		if (!this.scored) {
			if (this.puck.sprite.position.y > 1110) {
				game.effects.announcement("RED TEAM SCORES", "#ff0000");
				this.puck.sprite.alpha = 0;
				this.scored = true;
				this.opts.turnsRemaining--;
				this.opts.onScore(TEAM_COLORS.blue);
				game.effects.winStripes("blue");
				game.phaser.camera.shake(0.01, 400);
			} else if (this.puck.sprite.position.y < 290) {
				game.effects.announcement("BLUE TEAM SCORES", "#0000ff");
				this.puck.sprite.alpha = 0;
				this.scored = true;
				this.opts.turnsRemaining--;
				this.opts.onScore(TEAM_COLORS.red);
				game.effects.winStripes("red");
				game.phaser.camera.shake(0.01, 400);
			}
		}
	}

	update() {
		const _this = this;

		for(let t of this.teams) {
			for(let p of t.players) {
				p.clampVelocity();
			}
			t.update();
		}
		this.puck.clampVelocity();


		if (this.executingTurn) {
			this.checkEvents();
			if (this.destroyed) return;

			let allVelocityDone = true;

			for(let t of this.teams) {
				for(let p of t.players) {
					if (game.utils.magnitude(p.sprite.body.velocity) > 1) allVelocityDone = false;
				}
			}

			allVelocityDone = allVelocityDone && (game.utils.magnitude(this.puck.sprite.body.velocity) < 1);

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
