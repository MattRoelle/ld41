class TitleController {
	constructor(params) {
		this.destroyables = [];
		game.phaser.camera.setPosition(0, 0);

		const rp = game.phaser.add.sprite(400, -1400, "rinkpreview");
		this.destroyables.push(rp);
		rp.anchor.set(0.5, 0);
		//rp.fixedToCamera = true;
		game.phaser.add.tween(rp.position)
		.to({
			x: 400,
			y: -400
		}, 2000, Phaser.Easing.Quadratic.Out, true);

		const title = game.phaser.add.sprite(400, 1400, "title");
		title.anchor.set(0.5, 0.5);
		this.destroyables.push(title);
		game.phaser.add.tween(title.position)
		.to({
			x: 400,
			y: 130
		}, 2000, Phaser.Easing.Quadratic.Out, true);

		const btn1player = game.phaser.add.sprite(400, 1400, "1player");
		btn1player.anchor.set(0.5, 0.5);
		this.destroyables.push(btn1player);
		game.phaser.add.tween(btn1player.position)
		.to({
			x: 400,
			y: 280
		}, 2000, Phaser.Easing.Quadratic.Out, true);
		btn1player.inputEnabled = true;
		btn1player.events.onInputDown.add(() => {
			game.switchState(GAME_STATES.IN_GAME, {
				players: 1,
			});
		});

		const btn2player = game.phaser.add.sprite(400, 1400, "2player");
		btn2player.anchor.set(0.5, 0.5);
		this.destroyables.push(btn2player);
		game.phaser.add.tween(btn2player.position)
		.to({
			x: 400,
			y: 340
		}, 2000, Phaser.Easing.Quadratic.Out, true);
		btn2player.inputEnabled = true;
		btn2player.events.onInputDown.add(() => {
			game.switchState(GAME_STATES.IN_GAME, {
				players: 2,
			});
		});

		const tutbutton = game.phaser.add.sprite(400, 1400, "tutbutton");
		tutbutton.anchor.set(0.5, 0.5);
		this.destroyables.push(tutbutton);
		game.phaser.add.tween(tutbutton.position)
		.to({
			x: 400,
			y: 400
		}, 2000, Phaser.Easing.Quadratic.Out, true);
		tutbutton.inputEnabled = true;
		tutbutton.events.onInputDown.add(() => {
			this.tutorial.position.y = 0;
		});

		this.tutorial = game.phaser.add.sprite(0, 0, "tutorial");
		this.tutorial.inputEnabled = true;
		this.tutorial.position.y = -600;
		this.tutorial.events.onInputDown.add(() => {
			this.tutorial.position.y = -600;
		});

		this.globalUI = new GlobalUI();
	}

	update() {
	}

	render() {
		this.globalUI.bringToTop();
	}

	destroy() {
		for(let d of this.destroyables) d.destroy();
		this.globalUI.destroy();
	}
}
