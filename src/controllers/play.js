
class PlayController {
	constructor(params) {
		this.destroyables = [];
		this.topRink = game.phaser.add.sprite(-100, 0, "rinktop");
		this.destroyables.push(game.phaser.add.sprite(-100, 0, "rink"));
		this.destroyables.push(this.topRink);
		game.phaser.world.setBounds(-100, -50, 1000, 1400);
		game.phaser.camera.y = 600;

		this.ui = game.phaser.add.sprite(0, 0, "ui");
		this.ui.fixedToCamera = true;
		this.destroyables.push(this.ui);

		this.gameData = {
			redScore: 0,
			blueScore: 0
		};

		this.timeLabel = game.phaser.add.text(318, 20, "time", {
			font: "36px slkscr",
			fill: "#33ff44",
			stroke: "#000000",
			strokeThickness: 2,
			align: "center"
		});
		this.timeLabel.anchor.set(0.5);
		this.timeLabel.fixedToCamera = true;

		this.timeText = game.phaser.add.text(488, 20, "20", {
			font: "36px slkscr",
			fill: "#33ff44",
			stroke: "#000000",
			strokeThickness: 2,
			align: "center"
		});
		this.timeText.anchor.set(0.5);
		this.timeText.fixedToCamera = true;

		this.blueScore = game.phaser.add.text(130, 18, "0", {
			font: "36px slkscr",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 2,
			align: "center"
		});
		this.blueScore.anchor.set(0.5);
		this.blueScore.fixedToCamera = true;

		this.redScore = game.phaser.add.text(660, 18, "0", {
			font: "36px slkscr",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 2,
			align: "center"
		});
		this.redScore.anchor.set(0.5);
		this.redScore.fixedToCamera = true;

		this.submitBtn = game.phaser.add.sprite(400, 600, "redendturn");
		this.submitBtn.anchor.set(0.5, 1);
		this.submitBtn.fixedToCamera = true;
		this.submitBtn.inputEnabled = true;
		this.submitBtn.events.onInputDown.add(() => {
			this.hockeyGame.executeTurn();
		}, this);

		this.opts = {
			onScore: (team) => {
				this.crowd.cheer();

				if (team == TEAM_COLORS.red) {
					this.gameData.redScore++;
					this.opts.startingTeam = 0;
				}

				else if (team == TEAM_COLORS.blue) {
					this.gameData.redScore++;
					this.opts.startingTeam = 1;
				}

				this.updateUi();
				this.setupGame();
			},
			startingTeam: 1,
			turnsRemaining: 10
		};

		this.setupGame();
		this.crowd = new Crowd();
		this.lastTurnIdx = 0;
	}

	setupGame() {
		if (!!this.hockeyGame) {
			this.hockeyGame.destroy();
		}
		this.hockeyGame = new HockeyGame(this.opts);
	}

	updateUi() {
		this.redScore.text = this.gameData.redScore;
		this.blueScore.text = this.gameData.blueScore;
	}

	update() {
		this.hockeyGame.update();

		this.timeText.text = this.opts.turnsRemaining;

		if (this.lastTurnIdx != this.hockeyGame.currentTeamsTurn) {
			this.lastTurnIdx = this.hockeyGame.currentTeamsTurn;
			if (this.lastTurnIdx == 1) {
				this.submitBtn.loadTexture("blueendturn", 0);
			} else {
				this.submitBtn.loadTexture("redendturn", 0);
				if (this.hockeyGame.teams[0].constructor === AIHockeyTeam) {
					const _this = this;
					setTimeout(() => {
						_this.hockeyGame.executeTurn();
					}, 500);
				}
			}
		}

		if (game.input.up()) game.phaser.camera.y -= 14;
		if (game.input.down()) game.phaser.camera.y += 10;
		if (game.input.left()) game.phaser.camera.x -= 10;
		if (game.input.right()) game.phaser.camera.x += 10;
	}

	render() {
		this.hockeyGame.render();
		this.topRink.bringToTop();
		this.crowd.render();
		this.ui.bringToTop();
		this.blueScore.bringToTop();
		this.redScore.bringToTop();
		this.submitBtn.bringToTop();
		this.timeLabel.bringToTop();
		this.timeText.bringToTop();
	}

	destroy() {
		for(let d of this.destroyables) d.destroy();
	}
}
