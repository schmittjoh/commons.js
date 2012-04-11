goog.provide('jms.structs.Edge');

/**
 * @constructor
 * @param {!jms.structs.Node} sourceNode
 * @param {!jms.structs.Node} destNode
 * @param {*=} opt_value
 */
jms.structs.Edge = function(sourceNode, destNode, opt_value) {
    this.sourceNode_ = sourceNode;
    this.destNode_ = destNode;
    this.value_ = opt_value || null;
    
    sourceNode.addOutEdge(this);
    destNode.addInEdge(this);
};

/**
 * @return {!jms.structs.Node}
 */
jms.structs.Edge.prototype.getSourceNode = function() {
    return this.sourceNode_;
};

/**
 * @return {!jms.structs.Node}
 */
jms.structs.Edge.prototype.getDestNode = function() {
    return this.destNode_;
};

/**
 * @return {*}
 */
jms.structs.Edge.prototype.getValue = function() {
    return this.value_;
};