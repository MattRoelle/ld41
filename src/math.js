// taken from
// https://stackoverflow.com/questions/13937782/calculating-the-point-of-intersection-of-two-lines
//

(function () {
	window.line_intersect = function(x1, y1, x2, y2, x3, y3, x4, y4)
	{
		var ua, ub, denom = (y4 - y3)*(x2 - x1) - (x4 - x3)*(y2 - y1);
		if (denom == 0) {
		    return null;
		}
		ua = ((x4 - x3)*(y1 - y3) - (y4 - y3)*(x1 - x3))/denom;
		ub = ((x2 - x1)*(y1 - y3) - (y2 - y1)*(x1 - x3))/denom;
		return {
		    x: x1 + ua * (x2 - x1),
		    y: y1 + ub * (y2 - y1),
		    seg1: ua >= 0 && ua <= 1,
		    seg2: ub >= 0 && ub <= 1
		};
	};

	window.line_angle = function(x1, y1, x2, y2, x3, y3, x4, y4) {
		const m1 = (y2 - y1)/(x2 - x1);
		const m2 = (y4 - y3)/(x4 - x3);
		return Math.atan(Math.abs((m2 - m1)/(1 + (m1*m2))));
	};
}());
