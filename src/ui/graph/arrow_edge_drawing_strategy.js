goog.provide('jms.ui.graph.ArrowEdgeDrawingStrategy');

goog.require('goog.iter');
goog.require('goog.array');
goog.require('jms.math.Vec2');

goog.require('jms.ui.graph.EdgeDrawingStrategy');

/**
 * @constructor
 * @implements {jms.ui.graph.EdgeDrawingStrategy}
 */
jms.ui.graph.ArrowEdgeDrawingStrategy = function() {
    this.addIndex_ = false;
};

/**
 * @param {boolean} bool
 */
jms.ui.graph.ArrowEdgeDrawingStrategy.prototype.setAddIndex = function(bool) {
    this.addIndex_ = bool;
};

/**
 * @override
 */
jms.ui.graph.ArrowEdgeDrawingStrategy.prototype.drawEdges = function(graphics, graph, nodeArea) {
    graphics.clear();

    /**
     * @param {goog.math.Rect} bounds
     * @param {number} size
     */
    var addMargin = function(bounds, size) {
        bounds.top -= size;
        bounds.left -= size;
        bounds.width += size*2;
        bounds.height += size*2;
    };
    
    var arrowCount = 0;
    goog.iter.forEach(graph.getNodes().getValueIterator(), function(node1) {
        var uiNode1 = nodeArea.getChild(node1.getId());
        if (null === uiNode1) {
            return;
        }
        var position1 = uiNode1.getCenter();
        var bounds1 = uiNode1.getBounds();
        addMargin(bounds1, 7);

        goog.array.forEach(node1.getOutEdges(), function(edge) {
            var node2 = edge.getDestNode();
            var uiNode2 = nodeArea.getChild(node2.getId());
            if (null === uiNode2) {
                return;
            }
            var bounds2 = uiNode2.getBounds();
            addMargin(bounds2, 7);
            var position2 = uiNode2.getCenter();
            var position1Clone = position1.clone();

            // determine bounding position
            var diffVector = jms.math.Vec2.difference(position1Clone, position2);
            diffVector.normalize();

            while (bounds2.contains(position2)) {
                position2 = goog.math.Coordinate.sum(position2, diffVector);
            }
            while (bounds1.contains(position1Clone)) {
                position1Clone = goog.math.Coordinate.difference(position1Clone, diffVector);
            }
            
            var color;
            if (/** @type {boolean} */ (edge.getValue())) {
                color = '#CCCCCC';
            } else {
                color = '#000000';
            }

            this.drawArrow_(graphics, position1Clone, position2, diffVector, color, ++arrowCount);
        }, this);
    }, this);
};

/**
 * @private
 * @param {!goog.graphics.AbstractGraphics} graphics
 * @param {!goog.math.Coordinate} pos1
 * @param {!goog.math.Coordinate} pos2
 * @param {!jms.math.Vec2} vector
 * @param {string} color
 * @param {number} index
 */
jms.ui.graph.ArrowEdgeDrawingStrategy.prototype.drawArrow_ = function(graphics, pos1, pos2, vector, color, index) {
    var stroke = new goog.graphics.Stroke(2, color);
    var solidFill = new goog.graphics.SolidFill(color);
    var drawingVector;
    
    var path = new goog.graphics.Path();
    path.moveTo(pos1.x, pos1.y);
    path.lineTo(pos2.x, pos2.y);
    
    drawingVector = vector.clone().rotate(50).scale(10).add(pos2);
    path.moveTo(pos2.x, pos2.y);
    path.lineTo(drawingVector.x, drawingVector.y);
    
    drawingVector = vector.rotate(-50).scale(10).add(pos2);
    path.moveTo(pos2.x, pos2.y);
    path.lineTo(drawingVector.x, drawingVector.y);
    graphics.drawPath(path, stroke, solidFill);
    
    if (this.addIndex_) {
        graphics.drawText(index + ".", (pos2.x + pos1.x)/2, (pos2.y + pos1.y)/2, 25, 25, 'center', 'center', new goog.graphics.Font(14, 'Arial'), new goog.graphics.Stroke(1, '#000000'), new goog.graphics.SolidFill('#FFFFFF'));
    }
};