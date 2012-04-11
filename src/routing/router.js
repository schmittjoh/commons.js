goog.provide('jms.routing.Router');
goog.provide('jms.routing.NoRouteFoundException');

goog.require('goog.array');
goog.require('jms.routing.Route');

/**
 * @constructor
 */
jms.routing.Router = function() {
    /**
     * @private
     * @type {!Array.<!jms.routing.Route>}
     */
    this.routes_ = [];
};

/**
 * @param {!jms.routing.Route} route
 */
jms.routing.Router.prototype.registerRoute = function(route) {
    goog.array.insert(this.routes_, route);
};

/**
 * @param {string} token
 * @return {!Object.<string, string>}
 */
jms.routing.Router.prototype.route = function(token) {
    var params = false;
    
    for (var i=0, c=this.routes_.length; i<c; i++) {
        params = this.routes_[i].matchesHash(token);
        if (false !== params) {
            break;
        }
    }
    
    if (false === params) {
        throw new jms.routing.Router.NoRouteFoundException;
    }
    
    return /** @type {!Object} */ (params);
};

/**
 * @param {!Object.<string, string>} params
 * @return {string}
 */
jms.routing.Router.prototype.generate = function(params) {
    for (var i=0, c=this.routes_.length; i<c; i++) {
        if (this.routes_[i].matchesParameters(params)) {
            return this.routes_[i].generate(params);
        }
    }
    
    throw new jms.routing.Router.NoRouteFoundException;
};

/**
 * @constructor
 */
jms.routing.Router.NoRouteFoundException = function() { };

