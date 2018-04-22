let ID = 0;

const GOAL_1 = { x: 400, y: 190 };
const GOAL_2 = { x: 400, y: 1210 };

const BOUNDS = [
	[	[101, 0], [100, 1600] ],
	[	[701, -0], [700, 1600] ]
];

function castLineOnField(sx, sy, fx, fy) {
	const ret = [];

	let intersection = null;
	let bi = null;
	let intersectedBound = null;
	let i = 0;
	for(let b of BOUNDS) {
		const li = line_intersect(sx, sy, fx, fy, b[0][0], b[0][1], b[1][0], b[1][1]);
		if (li != null && li.seg1 && li.seg2 && intersection == null) {
			intersectedBound = b;
			intersection = li;
			bi = i;
		}
		i++;
	}

	if (intersection != null) {
		const distance = game.utils.dist(sx, sy, intersection.x, intersection.y);
		const idistance = game.utils.dist(sx, sy, fx, fy);
		const rdistance = idistance - distance;

		ret.push({x: intersection.x, y: intersection.y, t: (distance/idistance) });

		const rise = intersection.y - sy;

		const bb = intersectedBound;
		let theta;

		if (bi == 0) {
			theta = line_angle(
				sx, sy,
				fx, fy,
				bb[0][0], bb[0][1],
				bb[1][0], bb[1][1],
			);
			if (rise < 0) theta -= Math.PI/2;
			else theta = (theta*-1) + Math.PI/2;
		} else if (bi == 1) {
			theta = line_angle(
				sx, sy,
				fx, fy,
				bb[0][0], bb[0][1],
				bb[1][0], bb[1][1],
			);
			theta *= -1;

			if (rise < 0) theta -= Math.PI/2;
			else theta = (theta*-1) + Math.PI/2;
		}

		ret.push({
			x: intersection.x + (rdistance*Math.cos(theta)),
			y: intersection.y + (rdistance*Math.sin(theta)),
			t: (rdistance/idistance)
		});
	} else {
		ret.push({ x: fx, y: fy, t: 1 });
	}

	return ret;
}

const TEAM_COLORS = {
	red: 0,
	blue: 1
};

const TEAM_SIDE = {
	top: 0,
	bottom: 1
};
