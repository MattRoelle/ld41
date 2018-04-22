class HockeyGame {
	constructor(opts) {
		this.opts = opts;
		this.teams = [
			new AIHockeyTeam(TEAM_COLORS.red, TEAM_SIDE.top, this, 0),
			//new ControlledHockeyTeam(TEAM_COLORS.red, TEAM_SIDE.top, this, 0),
			new ControlledHockeyTeam(TEAM_COLORS.blue, TEAM_SIDE.bottom, this, 1)
		];

		this.bounds = [];
		for(let b of BOUNDS) {
			const s = game.phaser.add.sprite(b.x, b.y, null);
			game.phaser.physics.enable([s], Phaser.Physics.P2JS);
			s.body.static = true;
			s.body.addRectangle(b.w, b.h);
			s.body.rotation = b.r;
			s.body.debug = DEBUG;
			this.bounds.push(s);
		}

		this.puck = new HockeyPuck(400, 700);

		this.executingTurn = false;
		this.processingFight = false;
		this.turnEvents = [];
		this.nFights = 0;
		this.currentTeamsTurn = opts.startingTeam;
		this.scored = false;
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
		console.log(_this.opts.turnsRemaining);
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
				this.scored = true;
				this.opts.turnsRemaining--;
				this.opts.onScore(TEAM_COLORS.blue);
			} else if (this.puck.sprite.position.y < 290) {
				this.scored = true;
				this.opts.turnsRemaining--;
				this.opts.onScore(TEAM_COLORS.red);
			}
		}
	}

	update() {
		const _this = this;

		for(let t of this.teams) {
			for(let p of t.players) {
				p.clampVelocity();
				for(let b of this.bounds) {
					game.phaser.physics.arcade.collide(p.sprite, b);
					game.phaser.physics.arcade.collide(p.sprite, this.puck.sprite);
				}
			}
			t.update();
		}
		this.puck.clampVelocity();

		const allPlayers = this.teams[0].players.concat(this.teams[1].players);
		for(let i = 0; i < allPlayers.length; i++) {
			for(let j = 0; j < allPlayers.length; j++) {
				if (i != j) {
					game.phaser.physics.arcade.collide(allPlayers[i].sprite, allPlayers[j].sprite);
				}
			}
		}

		for(let b of this.bounds) {
			game.phaser.physics.arcade.collide(this.puck.sprite, b);
		}

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
