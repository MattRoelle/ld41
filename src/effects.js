class Effects {
	constructor() {
		this.fightAnims = [];
		this.ring = null;
	}

	render() {
		if (!!this.fightAnims) {
			for(let fa of this.fightAnims) {
				fa.bringToTop();
				fa.angle += fa.rotationSpeed;
			}
		}
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
}

