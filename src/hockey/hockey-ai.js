class AIHockeyTeam extends HockeyTeam {
	constructor(color, side, hgame) { super(color, side, hgame); }

	preExecuteTurn() {
		const playerClosestToPuck = _.orderBy(this.players, p => game.utils.dist(p.sprite.position.x, p.sprite.position.y, this.hgame.puck.sprite.position.x, this.hgame.puck.sprite.position.y))[0];

		let weHavePuck = false;

		for(let p of this.players) {
			p.aiInfo = {};
			if (p.collidingWithPuck) weHavePuck = true;
		}

		for(let p of this.players) {
			const x = p.sprite.position.x;
			const y = p.sprite.position.y;

			const closestOtherPlayer = _.orderBy(this.hgame.teams[1].players, p2 => game.utils.dist(x, y, p2.sprite.position.x, p2.sprite.position.y))[0];

			const closestOtherTeammate = _.orderBy(this.players, p2 => game.utils.dist(x, y, p2.sprite.position.x, p2.sprite.position.y))[0];

			if (p.collidingWithPuck) {
				if (Math.random() < 0.6) {
					// shoot
					if (Math.random() < 0.5) {
						p.pendingMovement = this.limitTarget({
							x: (x + x + GOAL_2.x)/3,
							y: (y + y + GOAL_2.y)/3
						}, p.sprite.position, C.MAX_SHOT_RANGE);
					} else {
						p.pendingMovement = this.limitTarget({
							x: (x + x + GOAL_2.x)/2,
							y: (y + y + GOAL_2.y)/2
						}, p.sprite.position, C.MAX_SHOT_RANGE);
					}
				} else {
					// pass
					closestOtherTeammate.aiInfo.beingPassedTo = true;
					closestOtherTeammate.pendingMovement = null;
					p.pendingMovement = this.limitTarget({
						x: closestOtherTeammate.sprite.position.x,
						y: closestOtherTeammate.sprite.position.y 
					}, p.sprite.position, C.MAX_SHOT_RANGE);
				}
			} else {
				if (!p.aiInfo.beingPassedTo) {
					if (Math.random() < 0) {
						// rush nearest player
						if (Math.random() < 0.5 && !!closestOtherPlayer.pendingMovement) {
							// predict movement
							p.pendingMovement = this.limitTarget({
								x: (closestOtherPlayer.sprite.position.x + closestOtherPlayer.pendingMovement.x)/2,
								y: (closestOtherPlayer.sprite.position.y + closestOtherPlayer.pendingMovement.y)/2
							}, p.sprite.position, C.MAX_MOVEMENT);
						} else {
							// dumb movement
							p.pendingMovement = this.limitTarget({
								x: closestOtherPlayer.sprite.position.x,
								y: closestOtherPlayer.sprite.position.y
							}, p.sprite.position, C.MAX_MOVEMENT);
						}
					} else {
						if (Math.random() < 1.0 && !weHavePuck) {
							// try to get to the puck
							p.pendingMovement = this.limitTarget({
								x: this.hgame.puck.sprite.position.x,
								y: this.hgame.puck.sprite.position.y
							}, p.sprite.position, C.MAX_MOVEMENT);
						} else {
							// nothing
						}
					}
				}
			}
		}
	}
}

