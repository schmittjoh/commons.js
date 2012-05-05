/**
 * @type {twig.Environment}
 */
var Twig = null;

var twig = {};

/**
 * @constructor
 */
twig.Environment = function() {};

/**
 * @param {Function} arg1
 * @param {Object=} opt_arg2
 * @return {string}
 */
twig.Environment.prototype.render = function(arg1, opt_arg2) {};

/**
 * @param {Function} arg1
 * @return {twig.Template}
 */
twig.Environment.prototype.createTemplate = function(arg1) {};

/**
 * @constructor
 * @param {twig.Environment} arg1
 */
twig.Template = function(arg1) {};


var profile = {};

/** 
 * @constructor
 * @param {twig.Environment} arg1
 * @extends {twig.Template}
 */
profile.macros = function(arg1) {};

/**
 * @return {string}
 */
profile.macros.prototype.getnoTargetTooltip = function() {};

/**
 * @return {string}
 */
profile.macros.prototype.getnoFbSettings = function() {};
