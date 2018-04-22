
class PlayController {
	constructor(params) {
		this.destroyables = [];
		this.topRink = game.phaser.add.sprite(-100, 0, "rinktop");
		this.destroyables.push(game.phaser.add.sprite(-100, 0, "rink"));
		this.destroyables.push(this.topRink);
		game.phaser.world.setBounds(-100, -50, 1000, 1400);
		game.phaser.camera.y = 600;

		this.ui = game.phaser.add.sprite(0, 0, null);
		this.ui.fixedToCamera = true;
		this.destroyables.push(this.ui);

		this.gameData = {
			redScore: 0,
			blueScore: 0
		};

		this.blueScore = game.phaser.add.text(130, 35, "0", {
			font: "60px slkscr",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 2,
			align: "center"
		});
		this.blueScore.anchor.set(0.5);
		this.blueScore.fixedToCamera = true;

		this.redScore = game.phaser.add.text(660, 35, "0", {
			font: "60px slkscr",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 2,
			align: "center"
		});
		this.redScore.anchor.set(0.5);
		this.redScore.fixedToCamera = true;

		this.submitBtn = game.phaser.add.sprite(400, 50, "submit-btn");
		this.submitBtn.anchor.set(0.5);
		this.submitBtn.fixedToCamera = true;
		this.submitBtn.inputEnabled = true;
		this.submitBtn.events.onInputDown.add(() => {
			this.hockeyGame.executeTurn();
		}, this);

		this.setupGame();
		this.crowd = new Crowd();
	}

	setupGame() {
		if (!!this.hockeyGame) {
			this.hockeyGame.destroy();
		}
		this.hockeyGame = new HockeyGame({
			onScore: (team) => {
				this.crowd.cheer();
				if (team == TEAM_COLORS.red) this.gameData.redScore++;
				else if (team == TEAM_COLORS.blue) this.gameData.redScore++;
				this.updateUi();
				this.setupGame();
			}
		});
	}

	updateUi() {
		this.redScore.text = this.gameData.redScore;
		this.blueScore.text = this.gameData.blueScore;
	}

	update() {
		this.hockeyGame.update();
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
	}

	destroy() {
		for(let d of this.destroyables) d.destroy();
	}
}
