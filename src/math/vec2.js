goog.provide('jms.math.Vec2');

goog.require('goog.math.Vec2');

/**
 * @constructor
 * @param {number} x
 * @param {number} y
 * @extends {goog.math.Vec2}
 */
jms.math.Vec2 = function(x, y) {
    goog.base(this, x, y);
};
goog.inherits(jms.math.Vec2, goog.math.Vec2);

/**
 * @param {number} degree
 * @return {!jms.math.Vec2}
 */
jms.math.Vec2.prototype.rotate = function(degree) {
    var cos = Math.cos(degree);
    var sin = Math.sin(degree);

    var x = cos * this.x - sin * this.y;
    this.y = sin * this.x + cos * this.y;
    this.x = x;
    
    return this;
};

/**
 * @return {!jms.math.Vec2}
 */
jms.math.Vec2.prototype.clone = function() {
    return new jms.math.Vec2(this.x, this.y);
};

/**
 * @param {!goog.math.Coordinate} coord1
 * @param {!goog.math.Coordinate} coord2
 * @return {!jms.math.Vec2}
 */
jms.math.Vec2.difference = function(coord1, coord2) {
    return new jms.math.Vec2(coord1.x - coord2.x, coord1.y - coord2.y);
};