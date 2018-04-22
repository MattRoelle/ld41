class Effects {
	constructor() {
		this.fightAnims = [];
		this.ring = null;
		this.top = [];
	}

	render() {
		if (!!this.fightAnims) {
			for(let fa of this.fightAnims) {
				fa.bringToTop();
				fa.angle += fa.rotationSpeed;
			}
		}
		for(let t of this.top) t.bringToTop();
	}

	fightAnim(x, y) {
		for(let i = 0; i < 50; i++) {
			const theta = Math.random()*Math.PI*2;
			const offset = (Math.random()*20)+20;
			const a = game.phaser.add.sprite(
				x + Math.cos(theta)*offset,
				y + Math.sin(theta)*offset,
				Math.random() < 0.5 ? "fightanim1" : "fightanim2"
			);
			const alpha = Math.random() * 0.9;
			a.alpha = 0;
			a.rotationSpeed = (Math.random()*3) + 1.5;
			if (Math.random() < 0.5) a.rotationSpeed *= -1;
			a.anchor.set(0.5);
			a.pivot.set(0.5);

			game.phaser.add.tween(a).to({alpha:alpha}, 500, Phaser.Easing.Quadratic.Out, true);

			const tw = game.phaser.add.tween(a.position)
			.to({
				x: x + Math.cos(theta)*offset + ((Math.random()*60) - 30),
				y: y + Math.sin(theta)*offset + ((Math.random()*60) - 30),
			}, 1250 + (Math.random()*300), Phaser.Easing.Quadratic.Out, true);
			this.fightAnims.push(a);

			tw.onComplete.add(() => {
				const tw2 = game.phaser.add.tween(a)
				.to({
					alpha: 0
				}, 300 + (Math.random()*300), Phaser.Easing.Quadratic.Out, true);
			});
		}
	}

	fightRing(x, y) {
		const ring = game.phaser.add.sprite(x, y, "yellowring");
		ring.anchor.set(0.5);
		ring.pivot.set(0.5);

		ring.scale.set(0);
		const tw = game.phaser.add.tween(ring.scale)
		.to({
			x: 2,
			y: 2
		}, 500, Phaser.Easing.Bounce.Out, true);
		setTimeout(() => {
			const tw2 = game.phaser.add.tween(ring)
			.to({
				alpha: 0
			}, 500, Phaser.Easing.Quadratic.Out, true);
		}, 1000);
	}

	winStripes(side) {
		for(let i = 0; i < 40; i++) {
			const s = game.phaser.add.sprite(400, side == "red" ? 50 : 1350, (side == "red" ? "blue" : "red") + "winstripe"); // hacks
			s.anchor.set(0.5);
			s.pivot.set(0.5);
			setTimeout(() => {
				const tw = game.phaser.add.tween(s.position)
				.to({
					y: (side == "red" ? 1400 : 0) + (Math.random() - 0.5)*150
				}, 1500 + (Math.random()*300), Phaser.Easing.Quadratic.Out, true);

				const tw2 = game.phaser.add.tween(s)
				.to({
					alpha: 0
				}, 1000, Phaser.Easing.Quadratic.Out, true);
			}, (Math.random()*700));
		}
	}

	announcement(t, color) {
		const text = game.phaser.add.text(400, 300, t, {
			font: "90px slkscr",
			fill: color,
			stroke: "#000000",
			strokeThickness: 6,
			align: "center",
			wordWrap: true,
			wordWrapWidth: 600
		});
		text.anchor.set(0.5);
		text.pivot.set(0.5);
		text.fixedToCamera = true;
		text.scale.set(0);
		text.angle = 80;
		const tw = game.phaser.add.tween(text.scale)
		.to({
			x: 1,
			y: 1
		}, 800, Phaser.Easing.Bounce.Out, true);
		const tw2 = game.phaser.add.tween(text)
		.to({
			angle: 0
		}, 800, Phaser.Easing.Bounce.Out, true);
		this.top.push(text);

		setTimeout(() => {
			const tw2 = game.phaser.add.tween(text)
			.to({
				alpha: 0
			}, 800, Phaser.Easing.Quadratic.Out, true);
		}, 1100);
	}
}

