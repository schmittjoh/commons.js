goog.provide('jms.ui.graph.SimpleEdgeDrawingStrategy');

goog.require('goog.graphics.Path');
goog.require('goog.graphics.SolidFill');
goog.require('goog.graphics.Stroke');

goog.require('jms.ui.graph.EdgeDrawingStrategy');

/**
 * @constructor
 * @implements {jms.ui.graph.EdgeDrawingStrategy}
 */
jms.ui.graph.SimpleEdgeDrawingStrategy = function() {};

/**
 * @inheritDoc
 */
jms.ui.graph.SimpleEdgeDrawingStrategy.prototype.drawEdges = function(graphics, graph, nodeArea) {
    graphics.clear();

    nodeArea.forEachChild(function(sourceNode) {
        goog.array.forEach(sourceNode.getModel().getOutEdges(), function(edge) {
            var destId = edge.getDestNode().getId();
            var destNode = nodeArea.getChild(destId);
            if (null === destNode) {
                return;
            }

            this.drawNodeConnection(graphics, sourceNode.getCenter(), destNode.getCenter());
        }, this);
        
    }, this);
};

/**
 * @protected
 * @param {!goog.math.Coordinate} sourcePos
 * @param {!goog.math.Coordinate} destPos
 * @param {string=} opt_color
 */
jms.ui.graph.SimpleEdgeDrawingStrategy.prototype.drawNodeConnection = function(graphics, sourcePos, destPos, opt_color) {
    var color = opt_color || '#000000';
    var path = new goog.graphics.Path();
    path.moveTo(sourcePos.x, sourcePos.y);
    path.lineTo(destPos.x, destPos.y);
    graphics.drawPath(path, new goog.graphics.Stroke(2, color), new goog.graphics.SolidFill(color));
};
