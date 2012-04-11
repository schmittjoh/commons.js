goog.provide('jms.ui.Navigator');

goog.require('goog.ui.Button');
goog.require('goog.ui.LinkButtonRenderer');
goog.require('goog.ui.Component');
goog.require('goog.events.EventHandler');

/**
 * @constructor
 * @param {number} currentPos
 * @param {number} maxPos
 * @param {number} stepSize
 * @param {goog.dom.DomHelper} domHelper
 * @extends {goog.ui.Component}
 */
jms.ui.Navigator = function(currentPos, maxPos, stepSize, domHelper) {
    goog.base(this, domHelper);
    
    this.currentPos_ = currentPos;
    this.maxPos_ = maxPos;
    this.stepSize_ = stepSize;
    
    this.previous_ = new goog.ui.Button('previous', goog.ui.LinkButtonRenderer.getInstance(), domHelper);
    this.previous_.addEventListener(goog.ui.Component.EventType.ACTION, goog.bind(this.onPrevious_, this));
    this.addChild(this.previous_, true);
    
    this.position_ = new goog.ui.Component(domHelper);
    this.addChild(this.position_, true);
    
    this.next_ = new goog.ui.Button('next', goog.ui.LinkButtonRenderer.getInstance(), domHelper);
    this.next_.addEventListener(goog.ui.Component.EventType.ACTION, goog.bind(this.onNext_, this));
    this.addChild(this.next_, true);
};
goog.inherits(jms.ui.Navigator, goog.ui.Component);

/**
 * @enum {string}
 */
jms.ui.Navigator.EventType = {
    NEXT: 'next',
    PREVIOUS: 'previous'
};

/**
 * @return {number}
 */
jms.ui.Navigator.prototype.getCurrentPos = function() {
    return this.currentPos_;
};

/**
 * @param {number} pos
 */
jms.ui.Navigator.prototype.setCurrentPos = function(pos) {
    if (pos > this.maxPos_ || pos < 0) {
        return;
    }
    
    this.currentPos_ = pos;
    this.updateState_();
};

/**
 * @return {number}
 */
jms.ui.Navigator.prototype.getStepSize = function() {
    return this.stepSize_;
};

jms.ui.Navigator.prototype.createDom = function() {
    this.setElementInternal(this.getDomHelper().createDom('div', {'class': 'jms-ui-navigator'}));
};

/**
 * @inheritDoc
 */
jms.ui.Navigator.prototype.enterDocument = function() {
    goog.base(this, 'enterDocument');
    
    this.updateState_();
};

/**
 * @override
 */
jms.ui.Navigator.prototype.canDecorate = function() {
    return false;
};

/**
 * @private
 */
jms.ui.Navigator.prototype.onPrevious_ = function(e) {
    this.currentPos_ = Math.max(0, this.currentPos_ - this.stepSize_);
    this.updateState_();

    this.dispatchEvent(jms.ui.Navigator.EventType.PREVIOUS);
};

/**
 * @private
 */
jms.ui.Navigator.prototype.onNext_ = function(e) {
    this.currentPos_ = Math.min(this.maxPos_, this.currentPos_ + this.stepSize_);
    this.updateState_();
    
    this.dispatchEvent(jms.ui.Navigator.EventType.NEXT);
};

/**
 * Updates the visual state of the component.
 * 
 * @private
 */
jms.ui.Navigator.prototype.updateState_ = function() {
    if (!this.isInDocument()) {
        return;
    }
    
    this.previous_.setEnabled(this.currentPos_ > 0);
    this.next_.setEnabled(this.currentPos_ < this.maxPos_);
    
    this.getDomHelper().setTextContent(this.position_.getElement(), (this.currentPos_ + 1) + '-' + Math.min(this.maxPos_ + 1, this.currentPos_ + this.stepSize_) + ' of ' + (this.maxPos_ + 1));
};