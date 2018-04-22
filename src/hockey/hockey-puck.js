class HockeyPuck extends Movable {
	constructor(x, y) {
		super();
		this.sprite = game.phaser.add.sprite(x, y, "puck");
		this.sprite.anchor.set(0.5);
		this.sprite.pivot.set(0.5);
		this.touchedLast = -1;
		game.phaser.physics.enable([this.sprite], Phaser.Physics.ARCADE);
		this.sprite.body.allowGravity = false;
		this.sprite.body.bounce.set(1);
		this.sprite.body.drag.set(100);
		this.sprite.body.setCircle(8);
	}

	render() {
		if (DEBUG) game.phaser.debug.body(this.sprite);
	}

	destroy() {
		this.sprite.destroy();
	}
}

