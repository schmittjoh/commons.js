goog.provide('jms.ui.ChoiceField');

goog.require('goog.ui.Component');
goog.require('goog.array');
goog.require('goog.events.EventHandler');

/**
 * @constructor
 * @param {string} name
 * @param {!Array.<{id: string, caption: string}>} choices
 * @param {string=} opt_defaultChoice
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @extends {goog.ui.Component}
 */
jms.ui.ChoiceField = function(name, choices, opt_defaultChoice, opt_domHelper) {
    goog.base(this, opt_domHelper);
    
    /**
     * @private
     * @type {string}
     */
    this.name_ = name;
    
    /**
     * @private
     * @type {!Array.<{id: string, caption: string}>}
     */
    this.choices_ = choices;
    
    /**
     * @private
     * @type {string}
     */
    this.defaultChoice_ = opt_defaultChoice || choices[0].id;
    
    /**
     * @private
     * @type {string}
     */
    this.selectedChoice_ = this.defaultChoice_;
    
    /**
     * @private
     * @type {!goog.events.EventHandler}
     */
    this.handler_ = new goog.events.EventHandler(this);
};
goog.inherits(jms.ui.ChoiceField, goog.ui.Component);

/**
 * @define {string}
 */
jms.ui.ChoiceField.CSS_BASE_NAME = 'jms-ui-choice-field';

/**
 * @private
 * @type {string|null}
 */
jms.ui.ChoiceField.prototype.label_ = null;

/**
 * @param {string|null} label
 */
jms.ui.ChoiceField.prototype.setLabel = function(label) {
    this.label_ = label;
};

/**
 * @override
 */
jms.ui.ChoiceField.prototype.createDom = function() {
    var dom = this.getDomHelper();
    var elem = dom.createDom('div', {
        'class': jms.ui.ChoiceField.CSS_BASE_NAME
    });
    
    if (null !== this.label_) {
        elem.appendChild(dom.createDom('span', {
            'class': this.getCssName_('label')
        }, this.label_));
    }
    
    goog.array.forEach(this.choices_, function(choice) {
        var choiceElem = dom.createDom('span', {
                'class': this.getCssName_('choice')
            },
            [
                dom.createDom('input', {
                    'name': this.name_,
                    'type': 'radio',
                    'class': this.getCssName_('radio'),
                    'id': this.getCssName_(choice.id)
                }),
                dom.createDom('label', {
                    'for': this.getCssName_(choice.id)
                }, choice.caption)
            ]
        );
        elem.appendChild(choiceElem);
    });
    
    this.setElementInternal(elem);
};

/**
 * @inheritDoc
 */
jms.ui.ChoiceField.prototype.enterDocument = function() {
    goog.base(this, 'enterDocument');
    
    var inputs = this.getInputs_();
    for (var i=0; i<inputs.length; i++) {
        var elem = /** @type {Element} */ (inputs[i]);
        
        if (elem.id === this.getCssName_(this.defaultChoice_)) {
            elem.checked = true;
        }
        elem.choiceId_ = elem.id.substring(new String(this.getCssName_('')).length);
        
        this.handler_.listen(elem, goog.events.EventType.CHANGE, this.onChoiceChange);
    }
};

/**
 * @inheritDoc
 */
jms.ui.ChoiceField.prototype.exitDocument = function() {
    goog.base(this, 'exitDocument');
    this.handler_.removeAll();
};

/**
 * @return {string}
 */
jms.ui.ChoiceField.prototype.getSelectedChoice = function() {
    return this.selectedChoice_;
};

/**
 * @param {string} choice
 */
jms.ui.ChoiceField.prototype.setSelectedChoice = function(choice) {
    this.selectedChoice_ = choice;
    
    if (this.isInDocument()) {
        var inputs = this.getInputs_();
        for (var i=0,c=inputs.length; i<c; i++) {
            if (inputs[i].choiceId_ === choice) {
                inputs[i].checked = true;
                break;
            }
        }
    }
};

/**
 * @param {!goog.events.Event} e
 */
jms.ui.ChoiceField.prototype.onChoiceChange = function(e) {
    this.selectedChoice_ = e.target.choiceId_;
    
    this.dispatchEvent(goog.events.EventType.CHANGE);
};

/**
 * @private
 * @param {string} name
 * @return {string}
 */
jms.ui.ChoiceField.prototype.getCssName_ = function(name) {
    return jms.ui.ChoiceField.CSS_BASE_NAME + '-' + name;
};

/**
 * @private
 * @return {{ length: number }}
 */
jms.ui.ChoiceField.prototype.getInputs_ = function() {
    return this.getDomHelper().getElementsByClass(this.getCssName_('radio'), this.getElement());
};
