class GlobalUI {
	constructor() {
		this.fullscreen = game.phaser.add.text(650, 40, "fullscreen", {
			font: "16px slkscr",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 4,
			align: "left"
		});
		this.fullscreen.fixedToCamera = true;
		this.fullscreen.inputEnabled = true;
		this.fullscreen.events.onInputDown.add(() => {
			game.fullscreen();
		});

		this.mute = game.phaser.add.text(10, 40, "mute", {
			font: "16px slkscr",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 4,
			align: "left"
		});
		this.mute.fixedToCamera = true;
		this.mute.inputEnabled = true;
		this.mute.events.onInputDown.add(() => {
			game.audio.toggleMute();
			if (game.audio.muted) {
				this.mute.text = "unmute";
			} else {
				this.mute.text = "mute";
			}
		});
	}

	bringToTop() {
		this.mute.bringToTop();
		this.fullscreen.bringToTop();
	}

	destroy() {
		this.mute.destroy();
		this.fullscreen.destroy();
	}
}
