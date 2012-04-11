goog.provide('jms.ui.ImageToggleButtonRenderer');

goog.require('goog.ui.ButtonRenderer');

/**
 * @constructor
 * @extends {goog.ui.ButtonRenderer}
 */
jms.ui.ImageToggleButtonRenderer = function() {
	goog.base(this);
};
goog.inherits(jms.ui.ImageToggleButtonRenderer, goog.ui.ButtonRenderer);
goog.addSingletonGetter(jms.ui.ImageToggleButtonRenderer);

/**
 * @inheritDoc
 */
jms.ui.ImageToggleButtonRenderer.prototype.getCssClass = function() {
	return goog.getCssName('jms-ui-image-toggle-button');
};

/**
 * @inheritDoc
 */
jms.ui.ImageToggleButtonRenderer.prototype.createDom = function(control) {
	var elem = goog.base(this, 'createDom', control);
	
	if (!control.isChecked()) {
		$(elem).fadeTo(0, 0.5);
	}
	
	return elem;
};

/**
 * @inheritDoc
 */
jms.ui.ImageToggleButtonRenderer.prototype.setState = function(control, state, enable) {
	goog.base(this, 'setState', control, state, enable);
	
	if (goog.ui.Component.State.HOVER === state) {
		if (!enable && !control.isChecked()) {
			$(control.getElement()).fadeTo('fast', 0.5);
		} else if (enable) {
			$(control.getElement()).fadeTo('fast', 1);
		}
	} else if (goog.ui.Component.State.CHECKED === state) {
		if (!enable && !control.isHighlighted()) {
			$(control.getElement()).fadeTo('fast', 0.5);
		} else if (enable) {
			$(control.getElement()).fadeTo('fast', 1);
		}
	}
};