class AIHockeyTeam extends HockeyTeam {
	constructor(color, side, hgame) { super(color, side, hgame); }

	preExecuteTurn() {
		const playerClosestToPuck = _.orderBy(this.players, p => game.utils.dist(p.sprite.position.x, p.sprite.position.y, this.hgame.puck.sprite.position.x, this.hgame.puck.sprite.position.y))[0];
		const onOffense = this.hgame.puck.sprite.position.y > 700;
		const onDefense = !onOffense;
		const pucky = this.hgame.puck.sprite.position.y;
		const goalx = 400;
		const goaly = 290;

		let nPlayersPuck = 0;

		for(let p of this.players) {
			const x = p.sprite.position.x;
			const y = p.sprite.position.y;
			const closestOtherPlayer = _.orderBy(this.hgame.teams[1].players, p2 => game.utils.dist(x, y, p2.sprite.position.x, p2.sprite.position.y))[0];
			const closestOtherTeammate = _.orderBy(this.players, p2 => game.utils.dist(x, y, p2.sprite.position.x, p2.sprite.position.y))[0];
		
			if (onDefense) {
				if ((y < pucky || Math.random() < 0.3)  && nPlayersPuck < 2) {
					// hit the puck 
					p.pendingMovement = this.limitTarget(this.randomPower(x, y, this.hgame.puck.sprite.position), p.sprite, C.MAX_MOVEMENT);
					nPlayersPuck++;
				} else {
					if (y > 700) {
						// get back on defense
						p.pendingMovement = this.limitTarget({
							x: x,
							y: y - 500
						}, p.sprite, C.MAX_MOVEMENT);
					} else {
						if (Math.random() < 0.5) {
							// charge another player
							p.pendingMovement = this.limitTarget(this.randomPower(x, y, closestOtherPlayer.sprite.position), p.sprite, C.MAX_MOVEMENT);
						} else {
							p.pendingMovement = this.limitTarget(this.randomPower(x, y, {
								x: goalx,
								y: goaly + 75
							}), p.sprite, C.MAX_MOVEMENT);
							// get in front of goal
						}
					}
				}
			} else {
				if ((y < pucky || playerClosestToPuck.id == p.id) && nPlayersPuck < 2) {
					// hit the puck 
					p.pendingMovement = this.limitTarget(this.randomPower(x, y, this.hgame.puck.sprite.position), p.sprite, C.MAX_MOVEMENT);
					nPlayersPuck++;
				} else {
					const r = Math.random();
					if (r < 0.4) {
						// charge another player
						p.pendingMovement = this.limitTarget(this.randomPower(x, y, closestOtherPlayer.sprite.position), p.sprite, C.MAX_MOVEMENT);
					} else if (r < 0.8) {
						// get to center
						p.pendingMovement = this.limitTarget(this.randomPower(x, y, {
							x: 400,
							y: 700
						}), p.sprite, C.MAX_MOVEMENT);
						// get in front of goal
					} else {
						// do nothing
					}
				}
			}
		}
	}

	randomPower(x, y, position) {
		const direction = Math.atan2(y - position.y, x - position.x) - Math.PI;
		const force = 50 + (Math.random()*50);
		return {
			x: x + Math.cos(direction)*force,
			y: y + Math.sin(direction)*force
		};
	}
}

