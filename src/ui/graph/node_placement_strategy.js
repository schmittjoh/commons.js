goog.provide('jms.ui.graph.NodePlacementStrategy');

goog.require('goog.structs.Map');
goog.require('goog.math.Coordinate');
goog.require('jms.structs.DirectedGraph');

/**
 * Interface for NodePlacementStrategies.
 * 
 * @interface
 */
jms.ui.graph.NodePlacementStrategy = function() {};

/**
 * Calculates the nodes' positions in a directed graph.
 * 
 * The implementation does not have to take care of scaling the resulting 
 * coordinates to fit into a particular space.
 *
 * @param {!jms.structs.DirectedGraph} graph
 * @return {!goog.structs.Map.<string, goog.math.Coordinate>}
 */
jms.ui.graph.NodePlacementStrategy.prototype.calculatePositions = goog.nullFunction;