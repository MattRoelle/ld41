// this is some of the worst ui code i've ever written

class TitleController {
	constructor(params) {
		this.destroyables = [];
		game.phaser.camera.setPosition(0, 0);

		this.players = 1;

		setTimeout(() => {
			game.audio.playSfx(SFX_TYPES.TITLE);
		}, 1000);

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
			if (this.optionsOpen) return;
			this.players = 1;
			this.openOptions();
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
			if (this.optionsOpen) return;
			this.players = 2;
			this.openOptions();
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
			if (this.optionsOpen) return;
			this.tutorial.position.y = 0;
		});

		this.tutorial = game.phaser.add.sprite(0, 0, "tutorial");
		this.tutorial.inputEnabled = true;
		this.tutorial.position.y = -600;
		this.tutorial.events.onInputDown.add(() => {
			this.tutorial.position.y = -600;
		});
		this.destroyables.push(this.tutorial);

		this.globalUI = new GlobalUI();

		this.optsGroup = game.phaser.add.group();
		const optionsBg = game.phaser.add.sprite(0, 0, "options");
		this.destroyables.push(optionsBg);
		this.optsGroup.add(optionsBg);
		const startBtn = game.phaser.add.sprite(300, 350, "startbtn");
		this.optsGroup.add(startBtn);
		this.destroyables.push(startBtn);

		this.gameLength = 20;

		this.t20Checkbox = this.addCheckbox(410, 170, this.optsGroup, () => {
			this.gameLength = 20;
			this.uncheckCheckbox(this.t40Checkbox);
		});
		this.checkCheckbox(this.t20Checkbox);

		this.t40Checkbox = this.addCheckbox(410, 235, this.optsGroup, () => {
			this.gameLength = 40;
			this.uncheckCheckbox(this.t20Checkbox);
		});


		startBtn.anchor.set(0.5);
		startBtn.inputEnabled = true;
		startBtn.events.onInputDown.add(() => {
			console.log(this.players);
			game.switchState(GAME_STATES.IN_GAME, {
				gameLength: this.gameLength,
				players: this.players,
				teamSize: this.ts
			});
		});

		this.ts1cb = this.addCheckbox(30, 160, this.optsGroup, () => { this.ts = 1; this.uncheckAllBut(1); });
		this.ts2cb = this.addCheckbox(30, 210, this.optsGroup, () => { this.ts = 2; this.uncheckAllBut(2); });
		this.ts3cb = this.addCheckbox(130, 160, this.optsGroup, () => { this.ts = 3; this.uncheckAllBut(3); });
		this.ts4cb = this.addCheckbox(130, 210, this.optsGroup, () => { this.ts = 4; this.uncheckAllBut(4); });
		this.checkCheckbox(this.ts3cb);
		this.ts = 3;

		this.optsGroup.position.x = 100;
		this.optsGroup.position.y = -3000;
	}

	uncheckAllBut(n) {
		if (n != 1) this.uncheckCheckbox(this.ts1cb);
		if (n != 2) this.uncheckCheckbox(this.ts2cb);
		if (n != 3) this.uncheckCheckbox(this.ts3cb);
		if (n != 4) this.uncheckCheckbox(this.ts4cb);
	}

	closeOptions() {
		if (!this.optionsOpen) return;
		this.optionsOpen = false;
		this.this.optsGroup.position.y = -3000;
	}

	openOptions() {
		if (this.optionsOpen) return;
		this.optionsOpen = true;
		this.optsGroup.position.y = 100;
	}

	addCheckbox(x, y, group, onClick) {
		const cb = game.phaser.add.sprite(x, y, "checkbox-unchecked");
		group.add(cb);
		cb.bringToTop()
		group.bringToTop(cb);
		cb.inputEnabled = true;
		cb.events.onInputDown.add(() => {
			this.checkCheckbox(cb);
			onClick();
		}, this);
		this.destroyables.push(cb);
		return cb;
	}

	checkCheckbox(cb) {
		cb.loadTexture("checkbox-checked");
	}

	uncheckCheckbox(cb) {
		cb.loadTexture("checkbox-unchecked");
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
