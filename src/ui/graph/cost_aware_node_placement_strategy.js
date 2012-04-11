goog.provide('jms.ui.graph.CostAwareNodePlacementStrategy');

goog.require('goog.iter');
goog.require('goog.array');

goog.require('jms.math.LineSegment');
goog.require('jms.ui.graph.NodePlacementStrategy');

/**
 * @constructor
 * @param {!jms.ui.graph.NodePlacementStrategy} strategy
 * @param {number=} opt_maxIterations
 * @param {number=} opt_minCost
 * @param {function(jms.structs.DirectedGraph, goog.structs.Map.<string, goog.math.Coordinate>)=} opt_costFunc
 * @implements {jms.ui.graph.NodePlacementStrategy}
 */
jms.ui.graph.CostAwareNodePlacementStrategy = function(strategy, opt_maxIterations, opt_minCost, opt_costFunc) {
    /**
     * @private
     * @type {!jms.ui.graph.NodePlacementStrategy}
     */
    this.strategy_ = strategy;
    
    /**
     * @private
     * @type {number}
     */
    this.maxIterations_ = opt_maxIterations || 5;
    
    /**
     * @private
     * @type {number}
     */
    this.minCost_ = opt_minCost || 0.1;
    
    /**
     * @private
     */
    this.costFunc_ = opt_costFunc || this.calculateCost_;
};

/**
 * @inheritDoc
 */
jms.ui.graph.CostAwareNodePlacementStrategy.prototype.calculatePositions = function(graph) {
    var positions, cost;
    var bestPositions, minCost = Infinity;
    
    for (var i=0; i<this.maxIterations_; i++) {
        positions = this.strategy_.calculatePositions(graph);
        cost = this.costFunc_(graph, positions);
        
        if (cost < minCost) {
            minCost = cost;
            bestPositions = positions;
        }

        if (cost < this.minCost_) {
            break;
        }
    }

    return /** @type {!goog.structs.Map.<string, goog.math.Coordinate>} */ (bestPositions);
};

/**
 * @private
 * @param {!goog.structs.Map.<string, goog.math.Coordinate>} positions
 * @return {number}
 */
jms.ui.graph.CostAwareNodePlacementStrategy.prototype.calculateCost_ = function(graph, positions) {
//    /** @type {!Array.<!jms.math.LineSegment>} */
//    var pairs = [];
    
    var minLength = Infinity, maxLength = -Infinity;
    goog.iter.forEach(graph.getNodes().getValueIterator(), function(node1) {
        var pos1 = positions.get(node1.getId());
        
        goog.array.forEach(node1.getOutEdges(), function(edge) {
            var pos2 = positions.get(edge.getDestNode().getId());
            var length = goog.math.Coordinate.distance(pos1, pos2);
            
            if (length < minLength) {
                minLength = length;
            }
            // no "else if" here
            if (length > maxLength) {
                maxLength = length;
            }
            
//            goog.array.insert(pairs, jms.math.LineSegment.fromCoordinates(pos1, pos2));
        });
    });
    
    window['console'].log('Min: ' + minLength + ', Max: ' + maxLength + ', Radio: ' + (1 - minLength/maxLength));
    
    // only one node
    if (minLength === Infinity && maxLength === Infinity) {
        return 0;
    }
    
    return 1 - minLength/maxLength; // the closer the ratio is to 1 the better the resulting graph
};

