const SFX_TYPES = {
	UNBELIEVABLE: { 
		key: "unbelievable",
		volume: 0.5
	},
	PUCK_HIT: { 
		key: "puckhit",
		volume: 0.5
	},
	PUCK_WALL: { 
		key: "puckwall",
		volume: 0.5
	},
	HIT1: { 
		key: "hit1",
		volume: 0.5
	},
	BLUE_TURN: {
		key: "blues-turn",
		volume: 0.5
	},
	RED_TURN: {
		key: "reds-turn",
		volume: 0.5
	},
	BLUE_WIN: {
		key: "blue-win",
		volume: 0.5
	},
	RED_WIN: {
		key: "red-win",
		volume: 0.5
	},
	TIE: {
		key: "tie",
		volume: 0.5
	},
};
 
class GameAudio {
	constructor() {
		this.muted = false;
	}

	toggleMute() {
		this.muted = !this.muted;
		game.phaser.sound.volume = this.muted ? 0 : 1;
		return this.muted;
	}

	playMusic() {
		this.music.play();
	}

	pauseMusic() {
		if (this.music) {
			this.music.pause();
		}
	}

	startMusic() {
		this.music = game.phaser.add.audio("music");
		this.music.loop = true;
		this.music.volume = 0.45;
		this.playMusic();
	}

	playSfx(s) {
		const sfx = game.phaser.add.audio(s.key);
		sfx.volume = s.volume;
		sfx.play();
	}
}
