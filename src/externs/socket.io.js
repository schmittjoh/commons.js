var io = {};

/**
 * @constructor
 */
io.Socket = function() {};

/**
 * @param {string} name
 * @param {...*} var_args
 */
io.Socket.prototype.emit = function(name, var_args) {};

/**
 * @param {string} name
 * @param {Function} callback
 */
io.Socket.prototype.on = function(name, callback) {};

/**
 * @param {string} arg1
 * @param {boolean=} opt_arg2
 * @return {io.Socket}
 */
io.connect = function(arg1, opt_arg2) {};

/**
 * @type {Array.<string>}
 */
io.transports;

