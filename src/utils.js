class Utils {
	dist(x1, y1, x2, y2) {
		return Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
	}

	padZero(n) {
		let s = n.toString();
		if (s.length <= 1) s = "0" + s;
		return s;
	}

	formatTime(dt) {
		const minutes = game.utils.padZero(Math.floor((dt/1000)/60));
		const seconds = game.utils.padZero(Math.floor(dt/1000)%60);
		const subseconds = game.utils.padZero(Math.floor((dt%1000)/10));
		return `${minutes}:${seconds}:${subseconds}`;
	}

}
