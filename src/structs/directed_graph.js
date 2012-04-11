goog.provide('jms.structs.DirectedGraph');

goog.require('goog.structs.Map');
goog.require('jms.structs.Edge');
goog.require('jms.structs.Node');

/**
 * @constructor
 */
jms.structs.DirectedGraph = function() {
    this.nodes_ = new goog.structs.Map();
    this.edges_ = [];
};

/**
 * @return {!Array.<jms.structs.Edge>}
 */
jms.structs.DirectedGraph.prototype.getEdges = function() {
    return this.edges_;
};

/**
 * @return {!goog.structs.Map}
 */
jms.structs.DirectedGraph.prototype.getNodes = function() {
    return this.nodes_;
};

/**
 * @param {!jms.structs.Node} node
 */
jms.structs.DirectedGraph.prototype.addNode = function(node) {
    this.nodes_.set(node.getId(), node);
};

/**
 * @param {string} id
 * @return {boolean}
 */
jms.structs.DirectedGraph.prototype.hasNode = function(id) {
    return this.nodes_.containsKey(id);
};

/**
 * @param {string} id
 * @return {!jms.structs.Node}
 */
jms.structs.DirectedGraph.prototype.getNode = function(id) {
    if (goog.DEBUG) {
        if (!this.hasNode(id)) {
            throw 'This graph has no node named "'+id+'".';
        }
    }
    
    return /** @type {!jms.structs.Node} */ (this.nodes_.get(id));
};

/**
 * @param {string} id
 * @param {*=} opt_value
 * @return {!jms.structs.Node}
 */
jms.structs.DirectedGraph.prototype.getOrCreateNode = function(id, opt_value) {
    if (this.hasNode(id)) {
        return this.getNode(id);
    }
    
    var node = new jms.structs.Node(id, opt_value);
    this.addNode(node);
    
    return node;
};

/**
 * @param {string} sourceId
 * @param {string} destId
 * @param {*=} opt_edgeValue
 */
jms.structs.DirectedGraph.prototype.connect = function(sourceId, destId, opt_edgeValue) {
    if (goog.DEBUG) {
        if (!this.nodes_.containsKey(sourceId)) {
            throw 'The node "' + sourceId + '" does not exist.';
        }
        if (!this.nodes_.containsKey(destId)) {
            throw 'The node "'+ destId + '" does not exist.';
        }
    }
    var sourceNode = /** @type {!jms.structs.Node} */ (this.nodes_.get(sourceId));
    var destNode = /** @type {!jms.structs.Node} */ (this.nodes_.get(destId));

    goog.array.insert(this.edges_, new jms.structs.Edge(sourceNode, destNode, opt_edgeValue));
};

