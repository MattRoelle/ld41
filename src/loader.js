class Loader {
	load(g) {
		g.load.image("logo", "assets/logo.png");
		g.load.image("rink", "assets/rink.png");
		g.load.image("rinktop", "assets/rinktop.png");
		g.load.image("red-player", "assets/red-player.png");
		g.load.image("blue-player", "assets/blue-player.png");
		g.load.image("puck", "assets/puck.png");
		g.load.image("submit-btn", "assets/submit-btn.png");
		g.load.image("ui", "assets/ui.png");
		g.load.image("fightanim1", "assets/fightanim.png");
		g.load.image("fightanim2", "assets/fightanim2.png");
		g.load.image("yellowring", "assets/yellowring.png");
		g.load.image("redshootring", "assets/redshootring.png");
		g.load.image("blueshootring", "assets/blueshootring.png");
		g.load.image("bluefan", "assets/bluefan.png");
		g.load.image("redfan", "assets/redfan.png");
		g.load.image("redwinstripe", "assets/redwinstripe.png");
		g.load.image("bluewinstripe", "assets/bluewinstripe.png");
		g.load.image("rinkpreview", "assets/rinkpreview.png");
		g.load.image("title", "assets/title.png");
		g.load.image("1player", "assets/1player.png");
		g.load.image("2player", "assets/2player.png");
		g.load.image("tutbutton", "assets/tutorialbtn.png");
		g.load.image("tutorial", "assets/tutorial.png");
		g.load.spritesheet("blueendturn", "assets/blueendturn.png", 340, 56);
		g.load.spritesheet("redendturn", "assets/redendturn.png", 340, 56);
		g.load.audio("unbelievable", ["assets/audio/pucking-unbelievable.wav"]);
		g.load.audio("puckhit", ["assets/audio/puckhit.ogg"]);
		g.load.audio("hit1", ["assets/audio/hit1.ogg"]);
	}
}

loader = new Loader();
