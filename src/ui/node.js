goog.provide('jms.ui.Node');

goog.require('goog.ui.Control');
goog.require('goog.math.Coordinate');
goog.require('goog.style');

/**
 * @constructor
 * @param {string} id
 * @param {*} model
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @extends {goog.ui.Control}
 */
jms.ui.Node = function(id, model, opt_domHelper) {
    goog.base(this, goog.string.truncateMiddle(id, 40), undefined, opt_domHelper);
    
    this.addClassName('jms-ui-node');
    this.setId(id);
    this.setModel(model);
    
    /**
     * @private
     * @type {goog.math.Size}
     */
    this.size_ = null;
};
goog.inherits(jms.ui.Node, goog.ui.Control);

/**
 * @private
 * @type {!goog.math.Coordinate}
 */
jms.ui.Node.prototype.position_ = new goog.math.Coordinate();

/**
 * @param {!goog.math.Coordinate} position
 */
jms.ui.Node.prototype.setPosition = function(position) {
    this.position_ = position;

    if (this.isInDocument()) {
        this.updatePosition_();
    }
};

/**
 * @return {!goog.math.Coordinate}
 */
jms.ui.Node.prototype.getPosition = function() {
    return this.position_;
};

/**
 * @return {!goog.math.Size}
 */
jms.ui.Node.prototype.getSize = function() {
    if (null === this.size_) {
        if (goog.DEBUG && !this.isInDocument()) {
            throw "jms.ui.Node.prototype.getSize() is only available on rendered components.";
        }
        
        this.size_ = goog.style.getSize(this.getElement());
    }
    
    return this.size_;
};

/**
 * @return {!goog.math.Rect}
 */
jms.ui.Node.prototype.getBounds = function() {
    var size = this.getSize();
    
    return new goog.math.Rect(this.position_.x, this.position_.y, size.width, size.height);
};

/**
 * @return {!goog.math.Coordinate}
 */
jms.ui.Node.prototype.getCenter = function() {
    var size = this.getSize();
    
    return new goog.math.Coordinate(
        this.position_.x + size.width  / 2, 
        this.position_.y + size.height / 2
    );
};

/**
 * @inheritDoc
 */
jms.ui.Node.prototype.enterDocument = function() {
    goog.base(this, 'enterDocument');
    this.updatePosition_();
    this.getElement().title = this.getId();
};

/**
 * @private
 */
jms.ui.Node.prototype.updatePosition_ = function() {
    var elem = this.getElement();
    goog.style.setStyle(elem, 'top', this.position_.y+'px');
    goog.style.setStyle(elem, 'left', this.position_.x+'px');
};

