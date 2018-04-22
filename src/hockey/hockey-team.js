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

	destroy() {
		for(let p of this.players) {
			p.destroy();
		}
	}
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

		this.lineColor = color == TEAM_COLORS.red ? 0xFF0000 : 0x0000FF;
	}

	destroy() {
		super.destroy();
		this.ui.selectingLine.destroy();
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
		this.ui.selectingLine.beginFill(this.lineColor, 0);
		this.ui.selectingLine.lineStyle(10, this.lineColor, 0.2);

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
			this.ui.selectingLine.beginFill(this.lineColor, 0);
			this.ui.selectingLine.lineStyle(10, this.lineColor, 0.2);
			this.ui.selectingLine.moveTo(points[0].x, points[0].y);
			this.ui.selectingLine.lineTo(points[1].x, points[1].y);
			this.ui.selectingLine.endFill();
		}
	}
}

