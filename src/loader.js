class Loader {
	load(g) {
		g.load.image("logo", "assets/logo.png");
		g.load.image("rink", "assets/rink.png");
		g.load.image("red-player", "assets/red-player.png");
		g.load.image("blue-player", "assets/blue-player.png");
		g.load.image("puck", "assets/puck.png");
		g.load.image("submit-btn", "assets/submit-btn.png");
		g.load.image("ui", "assets/ui.png");
	}
}

loader = new Loader();
