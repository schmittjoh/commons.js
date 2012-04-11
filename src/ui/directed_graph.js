goog.provide('jms.ui.DirectedGraph');

goog.require('goog.fx.Dragger');
goog.require('goog.iter');
goog.require('goog.math.Size');
goog.require('goog.math.Vec2');
goog.require('goog.math.Box');
goog.require('goog.math.Rect');
goog.require('goog.graphics');
goog.require('goog.style');
goog.require('goog.ui.Component');

goog.require('jms.ui.Node');
goog.require('jms.ui.graph.NodePlacementStrategy');
goog.require('jms.ui.graph.ForceDirectedNodePlacementStrategy');
goog.require('jms.ui.graph.ScalingStrategy');
goog.require('jms.ui.graph.SimpleScalingStrategy');
goog.require('jms.ui.graph.EdgeDrawingStrategy');
goog.require('jms.ui.graph.SimpleEdgeDrawingStrategy');

/**
 * @constructor
 * @param {!goog.math.Size} size
 * @param {!jms.structs.DirectedGraph} graph
 * @param {!jms.ui.graph.NodePlacementStrategy=} opt_nodePlacementStrategy
 * @param {!jms.ui.graph.ScalingStrategy=} opt_scalingStrategy
 * @param {!jms.ui.graph.EdgeDrawingStrategy=} opt_edgeDrawingStrategy
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @extends {goog.ui.Component}
 */
jms.ui.DirectedGraph = function(size, graph, opt_nodePlacementStrategy, opt_scalingStrategy, opt_edgeDrawingStrategy, opt_domHelper) {
    goog.base(this, opt_domHelper);

    /**
     * @private
     * @type {!goog.math.Size}
     */
    this.size_ = size;
    
    this.setModel(graph);

    var graphics = goog.graphics.createSimpleGraphics(size.width, size.height, size.width, size.height, opt_domHelper);
    if (null === graphics) {
        throw 'Sorry, your browser does not support graphics.';
    }
    
    /**
     * @type {!goog.graphics.AbstractGraphics}
     * @private
     */
    this.graphics_ = /** @type {!goog.graphics.AbstractGraphics} */ (graphics); 
    this.graphics_.setId('graphics');
    this.addChild(this.graphics_, true);

    /**
     * @private
     * @type {!jms.ui.graph.NodePlacementStrategy}
     */
    this.nodePlacementStrategy_ = opt_nodePlacementStrategy || new jms.ui.graph.ForceDirectedNodePlacementStrategy();
    
    /**
     * @private
     * @type {!jms.ui.graph.ScalingStrategy}
     */
    this.scalingStrategy_ = opt_scalingStrategy || new jms.ui.graph.SimpleScalingStrategy();

    /**
     * @private
     * @type {!jms.ui.graph.EdgeDrawingStrategy}
     */
    this.edgeDrawingStrategy_ = opt_edgeDrawingStrategy || new jms.ui.graph.SimpleEdgeDrawingStrategy();
    
    /**
     * @type {!goog.ui.Component}
     * @private
     */
    this.nodeArea_ = new goog.ui.Component(opt_domHelper);
    this.addChild(this.nodeArea_, true);

    this.initialize();
};
goog.inherits(jms.ui.DirectedGraph, goog.ui.Component);

/**
 * @protected
 */
jms.ui.DirectedGraph.prototype.initialize = function() {
    var rect = new goog.math.Rect(0, 0, this.size_.width-50, this.size_.height-50);
    
    // add children
    goog.iter.forEach(this.getModel().getNodes().getKeyIterator(), function(nodeId) {
        var node = this.createNode(nodeId, this.getModel().getNodes().get(nodeId));
        this.nodeArea_.addChild(node, true);
        
        var dragger = new goog.fx.Dragger(node.getElement(), undefined, rect);
        dragger.addEventListener(goog.fx.Dragger.EventType.DRAG, goog.bind(function(e) {
            var position = node.getPosition();
            position.x = e.left;
            position.y = e.top;
            
            this.edgeDrawingStrategy_.drawEdges(this.graphics_, this.getModel(), this.nodeArea_);
        }, this));
        dragger.setParentEventTarget(this);
    }, this);
};

/**
 * @param {string} id
 * @return {jms.ui.Node}
 */
jms.ui.DirectedGraph.prototype.getUiNode = function(id) {
    return /** @type {jms.ui.Node} */ (this.nodeArea_.getChild(id));
};

/**
 * @return {goog.math.Size}
 */
jms.ui.DirectedGraph.prototype.getSize = function() {
    return this.size_;
};

/**
 * @return {!goog.math.Coordinate}
 */
jms.ui.DirectedGraph.prototype.getCenter = function() {
    return new goog.math.Coordinate(
        this.size_.width/2-100,
        this.size_.height/2-100
    );
};

/**
 * @return {!goog.graphics.AbstractGraphics}
 */
jms.ui.DirectedGraph.prototype.getGraphics = function() {
    return this.graphics_;
};

/**
 * @param {!jms.structs.DirectedGraph} obj
 */
jms.ui.DirectedGraph.prototype.setModel = function(obj) {
    goog.base(this, 'setModel', obj);
};

/**
 * @return {!jms.structs.DirectedGraph}
 */
jms.ui.DirectedGraph.prototype.getModel = function() {
    return /** @type {!jms.structs.DirectedGraph} */ (goog.base(this, 'getModel'));
};

/**
 * Arranges the child elements
 */
jms.ui.DirectedGraph.prototype.arrange = function() {
    var graph = this.getModel();
    
    var positions = this.nodePlacementStrategy_.calculatePositions(graph);
    this.scalingStrategy_.scale(graph, positions, this.size_, this.nodeArea_);
    this.edgeDrawingStrategy_.drawEdges(this.graphics_, graph, this.nodeArea_);
};

/**
 * Updates the size of the element
 * @private
 */
jms.ui.DirectedGraph.prototype.updateSize_ = function() {
    var elem = this.getElement();
    if (null !== this.size_) {
        goog.style.setStyle(elem, 'width', this.size_.width+'px');
        goog.style.setStyle(elem, 'height', this.size_.height+'px');

//        this.graphics_.setSize(this.size_.width+100, this.size_.height+100);
//        this.graphics_.setCoordSize(this.size_.width+100, this.size_.height+100);
    } 
    this.arrange();
//    setInterval(goog.bind(this.arrange, this), 2000);
};

/**
 * This method can be overwritten by child classes to replace the default
 * node implementation.
 * 
 * @protected
 * @param {string} id
 * @param {*} model
 * @return {!jms.ui.Node}
 */
jms.ui.DirectedGraph.prototype.createNode = function(id, model) {
    return new jms.ui.Node(id, model, this.getDomHelper());
};

/**
 * @inheritDoc
 */
jms.ui.DirectedGraph.prototype.createDom = function() {
    var elem = this.getDomHelper().createDom('div', {
        'class': 'jms-ui-directed-graph'
    });

    this.setElementInternal(elem);
};

/**
 * @inheritDoc
 */
jms.ui.DirectedGraph.prototype.enterDocument = function() {
    goog.base(this, 'enterDocument');
    this.updateSize_();
};

