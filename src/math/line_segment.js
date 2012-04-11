goog.provide('jms.math.LineSegment');

goog.require('jms.math.Line');

/**
 * @constructor
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @extends {jms.math.Line}
 */
jms.math.LineSegment = function(x0, y0, x1, y1) {
    goog.base(this, x0, y0, x1, y1);
};
goog.inherits(jms.math.LineSegment, jms.math.Line);

/**
 * Determines whether two line segments intersect
 * 
 * @param {!jms.math.LineSegment} segment
 * @return {boolean}
 */
jms.math.LineSegment.prototype.intersects = function(segment) {
    // special case: parallel line segments
    if (false === goog.base(this, 'intersects', segment)) {
        return false;
    }
    
    // assume line equations of the form
    // y = a*x + b
    // y = c*x + d
    var a = this.slope_;
    var b = this.y0 - this.slope_ * this.x0;
    var c = segment.getSlope();
    var d = segment.y0 - c * segment.x0;
    
    var x = (d-b)/(a-c);
    
    var x1, x2;
    if (this.x0 < this.x1) {
        x1 = this.x0;
        x2 = this.x1;
    } else {
        x1 = this.x1;
        x2 = this.x0;
    }
    if (x1 > x || x > x2) {
        return false;
    }
    
    var x3, x4;
    if (segment.x0 < segment.x1) {
        x3 = segment.x0;
        x4 = segment.x1;
    } else {
        x3 = segment.x1;
        x4 = segment.x0;
    }
    
    return x3 <= x && x <= x4;
};

/**
 * Creates a line from two coordinates
 * 
 * @param {!goog.math.Coordinate} coord1
 * @param {!goog.math.Coordinate} coord2
 * @return {!jms.math.LineSegment}
 */
jms.math.LineSegment.fromCoordinates = function(coord1, coord2) {
    return new jms.math.LineSegment(coord1.x, coord1.y, coord2.x, coord2.y);
};