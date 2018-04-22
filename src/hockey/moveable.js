class Movable {
	moveTo(position, duration, spin) {
		this.movementCancelled = false;

		const sx = this.sprite.position.x;
		const sy = this.sprite.position.y;
		const fx = position.x;
		const fy = position.y;

		const points = castLineOnField(sx, sy, fx, fy);

		// only supporting 1 bounce b/c lazy
		
		if (spin) {
			game.phaser.add.tween(this.sprite).to({ angle: this.sprite.angle + 2000 }, duration, Phaser.Easing.Quadratic.Out, true);
		} else {
			this.lookAt(points[0]);
		}

		const ease1 = points.length > 1 ? Phaser.Easing.Quadratic.In :Phaser.Easing.Quadratic.InOut;

		this.activeTween = game.phaser.add.tween(this.sprite.position).to(points[0], points[0].t*duration, ease1, true);
		if (points.length > 1) {
			this.activeTween.onComplete.add(() => {
				if (!spin) {
					this.lookAt(points[1]);
				}
				if (this.movementCancelled) return;
				this.activeTween = game.phaser.add.tween(this.sprite.position).to(points[1], points[1].t*duration, Phaser.Easing.Quadratic.Out, true);
			});
		}
	}

	lookAt(position) {
		const theta = Math.atan2(this.sprite.position.y - position.y, this.sprite.position.x - position.x);
		this.sprite.angle = (theta*180/Math.PI) - 90;
	}

	cancelMovement() {
		this.movementCancelled = true;
		if (!!this.activeTween) this.activeTween.stop();
	}
}

