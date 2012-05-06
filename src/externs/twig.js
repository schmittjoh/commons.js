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
 * @param {Function} templateCtor
 * @param {string} macroName
 * @param {...*} var_args
 */
twig.Environment.prototype.macro = function(templateCtor, macroName, var_args) { };

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
