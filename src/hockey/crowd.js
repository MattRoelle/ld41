const NFANS = 150;
const CHEER_DURATION = 2000;

const CROWD_LEFT_BOUND = {
	x: -120,
	y: 350,
	w: 170,
	h: 700
};

const CROWD_RIGHT_BOUND = {
	x: 750,
	y: 350,
	w: 170,
	h: 700
};

class Crowd {
	constructor() {
		this.fans = [];
		this.blueFans = [];
		this.redFans = [];

		for(let side = -1; side <= 1; side += 2) {
			const bounds = side == -1 ? CROWD_LEFT_BOUND : CROWD_RIGHT_BOUND;
			for(let i = 0; i < NFANS; i++) {
				const color = Math.random() < 0.5 ? "red" : "blue";
				const x = bounds.x + (Math.random()*bounds.w);
				const y = bounds.y + (Math.random()*bounds.h);
				const s = game.phaser.add.sprite(x, y, color + "fan");
				s.anchor.set(0.5);
				s.pivot.set(0.5);
				s.adat = {
					toffsetx: Math.random()*1000,
					toffsety: Math.random()*1000,
					ox: x,
					oy: y,
				};
				if (side == 1) {
					s.scale.x = -1;
				}
				this.fans.push(s);
			}
		}

		this.cheering = false;
	}

	render() {
		const t = game.phaser.time.now;

		if (t - this.cheerStart > CHEER_DURATION) { this.cheering = false; } 
		
		for(let fan of this.fans) {
			fan.bringToTop();
			fan.adat.toffsetx += Math.random();
			fan.adat.toffsety += Math.random();
			fan.x = fan.adat.ox + Math.sin((t + fan.adat.toffsetx)/250)*3;
			fan.y = fan.adat.oy + Math.sin((t + fan.adat.toffsety)/250)*3;
			const rotSpeed = this.cheering ? 50 : 250;
			const roto = this.cheering ? 20 : 5;
			fan.angle = Math.sin((t + fan.adat.toffsety)/rotSpeed)*roto;
		}
	}

	cheer() {
		this.cheering = true;
		this.cheerStart = game.phaser.time.now;
	}
}
