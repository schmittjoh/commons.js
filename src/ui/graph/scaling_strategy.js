goog.provide('jms.ui.graph.ScalingStrategy');

goog.require('goog.structs.Map');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');

/**
 * Interface for scaling coordinates to fit into a particular space.
 * 
 * @interface
 */
jms.ui.graph.ScalingStrategy = function() {};

/**
 * Scales the positions to fit into a particular space, and applies the
 * new positions to the UI elements.
 * 
 * @param {!jms.structs.DirectedGraph} graph
 * @param {!goog.structs.Map.<string, goog.math.Coordinate>} positions
 * @param {!goog.math.Size} space
 * @param {!goog.ui.Component} nodeArea
 */
jms.ui.graph.ScalingStrategy.prototype.scale = goog.nullFunction;