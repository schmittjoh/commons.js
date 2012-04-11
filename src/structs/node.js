goog.provide('jms.structs.Node');

/**
 * @constructor
 * @param {string} id
 * @param {*=} opt_value
 */
jms.structs.Node = function(id, opt_value) {
    this.id_ = id;
    this.value_ = opt_value || null;
    this.inEdges_ = [];
    this.outEdges_ = [];
};

/**
 * @return {string}
 */
jms.structs.Node.prototype.getId = function() {
    return this.id_;
};

/**
 * @return {*}
 */
jms.structs.Node.prototype.getValue = function() {
    return this.value_;
};

/**
 * @param {*=} opt_value
 */
jms.structs.Node.prototype.setValue = function(opt_value) {
    this.value_ = opt_value;
};

/**
 * @return {!Array.<jms.structs.Edge>}
 */
jms.structs.Node.prototype.getInEdges = function() {
    return this.inEdges_;
};

/**
 * @return {!Array.<jms.structs.Edge>}
 */
jms.structs.Node.prototype.getOutEdges = function() {
    return this.outEdges_;
};

/**
 * @param {!jms.structs.Edge} edge
 */
jms.structs.Node.prototype.addInEdge = function(edge) {
    goog.array.insert(this.inEdges_, edge);
};

/**
 * @param {!jms.structs.Edge} edge
 */
jms.structs.Node.prototype.addOutEdge = function(edge) {
    goog.array.insert(this.outEdges_, edge);
};