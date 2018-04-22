class HockeyPuck extends Movable {
	constructor(x, y) {
		super();
		this.sprite = game.phaser.add.sprite(x, y, "puck");
		this.sprite.anchor.set(0.5);
		this.sprite.pivot.set(0.5);
		this.touchedLast = null;
		game.phaser.physics.p2.enable([this.sprite], Phaser.Physics.ARCADE);
		this.sprite.body.setCircle(18);
		this.sprite.body.restitution = 0.8;
		this.sprite.body.damping = 0.4;
		this.sprite.body.debug = DEBUG
	}

	render() {
		if (DEBUG) game.phaser.debug.body(this.sprite);
	}

	destroy() {
		this.sprite.destroy();
	}
}

