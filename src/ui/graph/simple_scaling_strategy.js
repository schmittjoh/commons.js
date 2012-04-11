goog.provide('jms.ui.graph.SimpleScalingStrategy');

goog.require('jms.ui.graph.ScalingStrategy');

/**
 * @constructor
 * @param {number=} opt_maxNodeDistance The maximum distance in px between two nodes
 * @implements {jms.ui.graph.ScalingStrategy}
 */
jms.ui.graph.SimpleScalingStrategy = function(opt_maxNodeDistance) {
    /**
     * @private
     * @type {number}
     */
    this.maxNodeDistance_ = opt_maxNodeDistance || 200;
};

/**
 * @inheritDoc
 */
jms.ui.graph.SimpleScalingStrategy.prototype.scale = function(graph, positions, space, nodeArea) {
    var box = new goog.math.Box(Infinity, -Infinity, -Infinity, Infinity);
    var maxSize = new goog.math.Size(-Infinity, -Infinity);
    var minDistance = Infinity, minSourcePos, minDestPos;

    goog.iter.forEach(positions.getKeyIterator(), function(id) {
        var position = positions.get(id);
        var child = nodeArea.getChild(id);
        
        if (null === child) {
            return;
        }
        
        // determine the boundary box
        if (position.x > box.right) {
            box.right = position.x;
        } else if (position.x < box.left) {
            box.left = position.x;
        }
        if (position.y > box.bottom) {
            box.bottom = position.y;
        } else if (position.y < box.top) {
            box.top = position.y;
        }
        
        // determine the maximum size of a single node
        var bounds = goog.style.getBounds(child.getElement());
        if (bounds.width > maxSize.width) {
            maxSize.width = bounds.width;
        }
        if (bounds.height > maxSize.height) {
            maxSize.height = bounds.height;
        }
        
        // determine distances to related nodes
        goog.array.forEach(graph.getNode(id).getOutEdges(), function(edge) {
            var destPos = positions.get(edge.getDestNode().getId());
            var distance = goog.math.Coordinate.distance(position, destPos);
            
            if (distance < minDistance) {
                minDistance = distance;
                minSourcePos = position;
                minDestPos = destPos;
            }
        }, this);
    });
    
    var availableSize = new goog.math.Size(space.width - maxSize.width/2, space.height - maxSize.height/2);
    var maxScaleFactorX = availableSize.width / (box.right - box.left);
    var maxScaleFactorY = availableSize.height / (box.bottom - box.top);
    
    // only one node
    if (!goog.isDef(minSourcePos)) {
        return;
    }
    
    minSourcePos = minSourcePos.clone();
    minDestPos = minDestPos.clone();
    
    var scaleFactorX = 0, scaleFactorY = 0, maxSteps = 50;
    var stepSizeX = maxScaleFactorX/maxSteps, stepSizeY = maxScaleFactorY/maxSteps;
    var sourcePos, destPos;
    for (var i=0; i<maxSteps; i++) {
        scaleFactorX += stepSizeX;
        scaleFactorY += stepSizeY;
        
        sourcePos = this.scalePos_(minSourcePos.clone(), box, scaleFactorX, scaleFactorY);
        destPos = this.scalePos_(minDestPos.clone(), box, scaleFactorX, scaleFactorY);
        
        if (goog.math.Coordinate.distance(sourcePos, destPos) >= this.maxNodeDistance_) {
            break;
        }
    }
    
    // apply new positions
    goog.iter.forEach(positions.getKeyIterator(), function(id) {
        var child = nodeArea.getChild(id);
        if (null === child) {
            return;
        }
        
        var position = this.scalePos_(positions.get(id), box, scaleFactorX, scaleFactorY);
        child.setPosition(position);
    });
};

/**
 * @private
 * @param {!goog.math.Coordinate} position
 * @param {!goog.math.Box} box
 * @param {number} scaleFactorX
 * @param {number} scaleFactorY
 * 
 * @return {!goog.math.Coordinate} the passed position
 */
jms.ui.graph.SimpleScalingStrategy.prototype.scalePos_ = function(position, box, scaleFactorX, scaleFactorY) {
    position.x = (position.x - box.left) * scaleFactorX;
    position.y = (position.y - box.top)  * scaleFactorY;
    
    return position;
};