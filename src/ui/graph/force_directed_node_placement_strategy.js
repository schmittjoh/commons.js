goog.provide('jms.ui.graph.ForceDirectedNodePlacementStrategy');

goog.require('goog.structs.Map');
goog.require('goog.iter');
goog.require('goog.array');
goog.require('goog.debug');
goog.require('goog.debug.FancyWindow');
goog.require('goog.debug.Logger');
goog.require('goog.debug.Trace');
goog.require('jms.ui.graph.NodePlacementStrategy');
goog.require('jms.structs.DirectedGraph');
goog.require('jms.structs.Node');
goog.require('jms.structs.Edge');

/**
 * @fileoverview
 * 
 * Inspired by Walshaw's algorithm to calculate the positions of nodes.
 * 
 * Overview:
 * Force-Directed Drawing Algorithms (Stephen G. Kobourov) 
 * http://www.cs.brown.edu/~rt/gdhandbook/chapters/force-directed.pdf (p. 10)
 * 
 * Detailed Explanation:
 * A Multilevel Algorithm for Force-Directed Graph-Drawing (Chris Walshaw)
 * http://www.cs.brown.edu/sites/jgaa/accepted/2003/Walshaw2003.7.3.pdf
 */

/**
 * @constructor
 * @param {number=} iterations
 * @param {number=} maxRepulsiveForceDistance
 * @param {number=} springLength
 * @param {number=} movementCoefficient
 * @param {number=} maxVertexMovement
 * @implements {jms.ui.graph.NodePlacementStrategy}
 */
jms.ui.graph.ForceDirectedNodePlacementStrategy = function(iterations, maxRepulsiveForceDistance, springLength, movementCoefficient, maxVertexMovement) {
    this.iterations_ = iterations || 500;
    this.maxRepulsiveForceDistance_ = maxRepulsiveForceDistance || 6;
    this.springLength_ = springLength || 2;
    this.squaredSpringLength_ = this.springLength_ * this.springLength_;
    this.movementCoefficient_ = movementCoefficient || 0.01;
    this.maxVertexMovement_ = maxVertexMovement || 0.5;
};

/**
 * This type is used by the strategy internally
 * 
 * @typedef {{id: string, pos: !goog.math.Coordinate, force: !goog.math.Vec2, outEdges: !Array.<jms.structs.Edge>}}
 */
jms.ui.graph.ForceDirectedNodePlacementStrategy.Node;

/**
 * @inheritDoc
 */
jms.ui.graph.ForceDirectedNodePlacementStrategy.prototype.calculatePositions = function(graph) {
    // initialize local map
    var nodes = new goog.structs.Map(), graphNodes = graph.getNodes(), graphEdges = graph.getEdges();
    var firstId;
    goog.iter.forEach(graphNodes.getKeyIterator(), function(id) {
        nodes.set(id, {
            id: id,
            pos: this.getInitialPosition(graphNodes.get(id)),
            force: new goog.math.Vec2(0, 0)
        });
        
        if (!goog.isDef(firstId)) {
            firstId = id;
        }
    }, this);
    goog.iter.forEach(nodes.getKeyIterator(), function(id) {
        var node = nodes.get(id);
        node.outEdges = [];
        goog.array.forEach(graphNodes.get(id).getOutEdges(), function(outEdge) {
            goog.array.insert(node.outEdges, nodes.get(outEdge.getDestNode().getId()));
        });
    });
    
    // run iterations
    for (var i=0; i<this.iterations_; i++) {
        // calculate global repulsive forces
        var processed = [];
        goog.iter.forEach(nodes.getValueIterator(), function(node1) {
            goog.array.forEach(processed, function(node2) {
                this.calculateRepulsiveForce_(node1, node2);
            }, this);
            
            goog.array.insert(processed, node1);
        }, this);
        
        // calculate local attractive forces
        goog.array.forEach(graphEdges, function(edge) {
            var sourceNode = nodes.get(edge.getSourceNode().getId());
            var destNode = nodes.get(edge.getDestNode().getId());
            
            this.calculateAttractiveForce_(sourceNode, destNode);
        }, this);

        // reposition nodes
        goog.iter.forEach(nodes.getValueIterator(), function(node) {
            node.force.scale(this.movementCoefficient_);

            if (Math.abs(node.force.x) > this.maxVertexMovement_) {
                node.force.x = goog.math.sign(node.force.x) * this.maxVertexMovement_;
            }
            if (Math.abs(node.force.y) > this.maxVertexMovement_) {
                node.force.y = goog.math.sign(node.force.y) * this.maxVertexMovement_;
            }

            node.pos = goog.math.Coordinate.sum(node.pos, node.force);
            node.force = new goog.math.Vec2(0, 0);
        }, this);
    }
    
    // prepare result map
    var result = new goog.structs.Map();
    goog.iter.forEach(nodes.getKeyIterator(), function(id) {
        result.set(id, nodes.get(id).pos);
    });
    
    return result;
};

/**
 * This can be overwritten by child classes if certain nodes can already be
 * grouped together, and therefore, improve the resulting node placement.
 * 
 * @protected
 * @param {!jms.structs.Node} node
 * @return {goog.math.Coordinate}
 */
jms.ui.graph.ForceDirectedNodePlacementStrategy.prototype.getInitialPosition = function(node) {
    return new goog.math.Coordinate();
};

/**
 * @private
 * @param {!jms.ui.graph.ForceDirectedNodePlacementStrategy.Node} node1
 * @param {!jms.ui.graph.ForceDirectedNodePlacementStrategy.Node} node2
 */
jms.ui.graph.ForceDirectedNodePlacementStrategy.prototype.calculateRepulsiveForce_ = function(node1, node2) {
    var differenceVector = goog.math.Vec2.difference(node2.pos, node1.pos);
    var squaredMagnitude = differenceVector.squaredMagnitude();
    
    if (squaredMagnitude < 0.01) {
        differenceVector = this.createRandomDifferenceVector_();
        squaredMagnitude = differenceVector.squaredMagnitude();
    }
    
    var magnitude = Math.sqrt(squaredMagnitude);
    if (magnitude < this.maxRepulsiveForceDistance_) {
        var repulsiveForce = this.squaredSpringLength_ / magnitude;
        
        // normalize and scale according to repulsive force
        differenceVector.scale(repulsiveForce/magnitude);
        
        node1.force.subtract(differenceVector);
        node2.force.add(differenceVector);
    }
};

/**
 * @private
 * @param {!jms.ui.graph.ForceDirectedNodePlacementStrategy.Node} node1
 * @param {!jms.ui.graph.ForceDirectedNodePlacementStrategy.Node} node2
 * @param {number=} opt_attraction
 */
jms.ui.graph.ForceDirectedNodePlacementStrategy.prototype.calculateAttractiveForce_ = function(node1, node2, opt_attraction) {
    var attraction = opt_attraction || 1;
    
    var differenceVector = goog.math.Vec2.difference(node2.pos, node1.pos);
    var squaredMagnitude = differenceVector.squaredMagnitude();
    if (squaredMagnitude < 0.01) {
        differenceVector = this.createRandomDifferenceVector_();
        squaredMagnitude = differenceVector.squaredMagnitude();
    }
    
    var magnitude = Math.sqrt(squaredMagnitude);
    if (magnitude > this.maxRepulsiveForceDistance_) {
        magnitude = this.maxRepulsiveForceDistance_;
        squaredMagnitude = magnitude * magnitude;
    }
    
    var attractiveForce = (squaredMagnitude - this.squaredSpringLength_) / this.springLength_;    
    attractiveForce *= Math.log(attraction) * 0.5 + 1;
    
    // normalize and scale
    differenceVector.scale(attractiveForce/magnitude);
    
    node1.force.add(differenceVector);
    node2.force.subtract(differenceVector);
};

/**
 * @private
 * @return {!goog.math.Vec2} vector
 */
jms.ui.graph.ForceDirectedNodePlacementStrategy.prototype.createRandomDifferenceVector_ = function() {
    return new goog.math.Vec2(
        0.1 + 0.1 * Math.random(),
        0.1 + 0.1 * Math.random()
    );
};
