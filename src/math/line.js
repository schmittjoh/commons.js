goog.provide('jms.math.Line');

goog.require('goog.math.Line');

/**
 * @constructor
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @extends {goog.math.Line}
 */
jms.math.Line = function(x1, y1, x2, y2) {
    goog.base(this, x1, y1, x2, y2);
    
    /**
     * @private
     * @type {number}
     */
    this.slope_ = (y2 - y1) / (x2 - x1);
};
goog.inherits(jms.math.Line, goog.math.Line);

/**
 * Returns the slope of this line
 * 
 * @return {number}
 */
jms.math.Line.prototype.getSlope = function() {
    return this.slope_;
};

/**
 * Determines whether the given line intersects this line
 * 
 * @param {!goog.math.Line} line
 * @return {boolean}
 */
jms.math.Line.prototype.intersects = function(line) {
    return this.slope_ !== line.getSlope();
};

/**
 * Creates a line from two coordinates
 * 
 * @param {!goog.math.Coordinate} coord1
 * @param {!goog.math.Coordinate} coord2
 * @return {!jms.math.Line}
 */
jms.math.Line.fromCoordinates = function(coord1, coord2) {
    return new jms.math.Line(coord1.x, coord1.y, coord2.x, coord2.y);
};
