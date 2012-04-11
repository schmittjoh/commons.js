goog.provide('jms.routing.Route');

goog.require('goog.string');
goog.require('goog.object');
goog.require('goog.array');

/**
 * This is a lightweight implementation of the symfony
 * routing system to allow ajax applications to have 
 * dynamic url anchors.
 * 
 * @constructor
 * @param {string} pattern
 * @param {Object.<string, string>=} opt_defaults
 * @param {Object.<string, string>=} opt_requirements
 * @param {Object.<string, string>=} opt_options
 */
jms.routing.Route = function(pattern, opt_defaults, opt_requirements, opt_options) {
    this.pattern_ = pattern;
    this.opt_defaults_ = opt_defaults || {};
    this.opt_requirements_ = opt_requirements || {};
    this.opt_options_ = opt_options || {};
    this.isBound_ = false;
    this.isCompiled_ = false;
};

/**
 * @private
 * @type {string}
 */
jms.routing.Route.prototype.pattern_;

/**
 * @private
 * @type {Object.<string, string>}
 */
jms.routing.Route.prototype.opt_defaults_;

/**
 * @private
 * @type {Object.<string, string>}
 */
jms.routing.Route.prototype.opt_requirements_;

/**
 * @private
 * @type {Object.<string, string>}
 */
jms.routing.Route.prototype.opt_options_;

/**
 * @private
 * @type {Object.<string, string>}
 */
jms.routing.Route.prototype.parameters_;

/**
 * @private
 * @type {RegExp}
 */
jms.routing.Route.prototype.regex_;

/**
 * @private
 * @type {Array.<string>}
 */
jms.routing.Route.prototype.regexMap_;

/**
 * @private
 * @type {string}
 */
jms.routing.Route.prototype.staticPrefix_;

/**
 * @private
 * @type {boolean}
 */
jms.routing.Route.prototype.isBound_;

/**
 * @private
 * @type {boolean}
 */
jms.routing.Route.prototype.isCompiled_;

/**
 * @const
 * @enum {string}
 */
jms.routing.Route.optionNames = {
    SUFFIX: 'a',
    VARIABLE_PREFIXES: 'b',
    VARIABLE_PREFIXES_REGEX: 'c',
    SEGMENT_SEPARATORS: 'd',
    VARIABLE_REGEX: 'e',
    TEXT_REGEX: 'f',
    VARIABLE_CONTENT_REGEX: 'g',
    GENERATE_SHORTEST_URL: 'h',    
    EXTRA_PARAMETERS_AS_QUERY_STRING: 'i',
    EXTRA_PARAMETERS_REGEX: 'j',
    SEGMENT_SEPARATORS_REGEX: 'k'
};

/**
 * @const
 * @enum {string}
 */
jms.routing.Route.paramNames = {
    MODULE: 'module',
    ACTION: 'action'
};

/**
 * Returns the pattern used for this route
 * @return {string}
 */
jms.routing.Route.prototype.getPattern = function() {
    return this.pattern_;
};

/**
 * Returns the defaults for this route
 * @return {Object.<string, string>}
 */
jms.routing.Route.prototype.getDefaults = function() {
    return this.opt_defaults_;
};

/**
 * Returns the requirements for this route
 * @return {Object.<string, string>}
 */
jms.routing.Route.prototype.getRequirements = function() {
    return this.opt_requirements_;    
};

/**
 * Returns the options for this route
 * @return {Object.<string, string>}
 */
jms.routing.Route.prototype.getOptions = function() {
    return this.opt_options_;
};

/**
 * Binds this route to the given parameters
 * @param {Object.<string, string>} parameters
 */
jms.routing.Route.prototype.bind = function(parameters) {
    this.isBound_ = true;
    this.parameters_ = parameters;
};

/**
 * Returns true if the route is bound to parameters
 * @return {boolean}
 */
jms.routing.Route.prototype.isBound = function() {
    return this.isBound_;
};

/**
 * Returns an array of parameters if the hash matches this route,
 * false otherwise
 * @param {string} hash
 * @return {boolean|Object.<string, string>}
 */
jms.routing.Route.prototype.matchesHash = function(hash) {
    if (this.isCompiled_ == false)
        this.compile_();
    
    // check if a static prefix exists, and if it does not match
    if (this.staticPrefix_ != '' 
        && goog.string.caseInsensitiveStartsWith(hash, this.staticPrefix_) == false)
    {
        return false;
    }
    
    var matches = this.regex_.exec(hash);
    if (matches == null)
    {
        return false;
    }
    
    var parameters = goog.object.clone(this.opt_defaults_);
    for (var i=1, c = this.regexMap_.length; i <= c; i++)
    {
        parameters[this.regexMap_[i-1]] = matches[i];
    }
    
    // check for extra parameters
    if (this.opt_options_[jms.routing.Route.optionNames.EXTRA_PARAMETERS_AS_QUERY_STRING] == true)
    {
        var extraParams = goog.array.peek(matches);
        var paramsRegex = new RegExp(
            this.opt_options_[
              jms.routing.Route.optionNames.EXTRA_PARAMETERS_REGEX
            ], 'g');
        var paramMatches;
        
        var matchedParams = '';
        while ((paramMatches = paramsRegex.exec(extraParams)) != null)
        {
            parameters[paramMatches[1]] = paramMatches[2];
            matchedParams += paramMatches[0];
        }
        
        if (extraParams != matchedParams)
        {
            return false;
        }
    }
    
    this.bind(parameters);
    
    return parameters;
};

/**
 * Returns true when the route matches the given parameters,
 * false otherwise.
 * @param {Object.<string, string>} params
 * @return {boolean}
 */
jms.routing.Route.prototype.matchesParameters = function(params) {
    if (this.isCompiled_ == false)
        this.compile_();

    params = goog.object.clone(params);
    
    // check whether all variables are defined in params
    if (goog.array.every(this.regexMap_, function(value, index, arr) {
        return value in params;
    }, this) == false)
        return false;
        
    // check whether all requirements are met
    if (goog.object.every(this.opt_requirements_, function(value, index, obj) {
        var regex = new RegExp('^' + value + '$');
        return regex.test(params[index]);
    }, this) == false)
        return false;
    
    // check whether all params are also route variables, or
    // if the extra_parameters option is set
    if (this.opt_options_[jms.routing.Route.optionNames.EXTRA_PARAMETERS_AS_QUERY_STRING] == false
        && goog.object.every(params, function(value, index, obj) {
            return (index in this.regexMap_);    
    }, this) == false)
        return false;
    
    // check that params is not overwriting any default values
    if (goog.object.every(params, function(value, index, obj) {
        return !(index in this.opt_defaults_) || this.opt_defaults_[index] == value;
    }, this) == false)
        return false;
    
    return true;
};

/**
 * Generates a URL from the given parameters
 * @param {Object.<string, string>} params
 * @return {string} The generated url hash
 */
jms.routing.Route.prototype.generate = function(params) {
    if (this.isCompiled_ == false)
        this.compile_();
    
    params = goog.object.clone(params);    
    goog.object.extend(params, this.opt_defaults_);
    
    if (goog.DEBUG)
    {
        if (this.matchesParameters(params) == false)
            throw new Error("The route does not match the given parameters.");
    }
    
    // replace the parameters in the url
    var url = this.pattern_;
    var regex = new RegExp(this.opt_options_[jms.routing.Route.optionNames.VARIABLE_PREFIXES_REGEX]
                                             + '(' + this.opt_options_[jms.routing.Route.optionNames.VARIABLE_REGEX] + ')', 'g');
    var matches;
    while ((matches = regex.exec(this.pattern_)) != null)
    {
        url = url.replace(matches[0], params[matches[1]]);
        delete params[matches[1]];
    }
    
    goog.object.forEach(params, function(value, key, obj) {
        if (key in this.opt_defaults_)
            return;
        
        var separator = this.opt_options_[jms.routing.Route.optionNames.SEGMENT_SEPARATORS][0];
        url += separator + key + separator + value;            
    }, this);
    
    return url;
};

/**
 * Compiles the current route instance
 * @private
 */
jms.routing.Route.prototype.compile_ = function() {
    if (this.isCompiled_ == true)
        return;
    this.isCompiled_ = true;
    
    this.fixRequirements_();
    this.initializeOptions_();
    
    // find all variables and replace them with regexes
    var regex = new RegExp(this.opt_options_[jms.routing.Route.optionNames.VARIABLE_PREFIXES_REGEX]
                           + '(' + this.opt_options_[jms.routing.Route.optionNames.VARIABLE_REGEX] + ')', 'g');
    var routeRegex = this.pattern_;
    var regexMap = [];
    var minIndex = undefined;
    var matches;
    while ((matches = regex.exec(this.pattern_)) != null)
    {
        // if there is a requirement regex, use it instead of the default regex
        var contentRegex = 
            matches[1] in this.opt_requirements_ ?
                    this.opt_requirements_[matches[1]]
                    :
                    this.opt_options_[jms.routing.Route.optionNames.VARIABLE_CONTENT_REGEX];
        routeRegex = routeRegex.replace(matches[0], contentRegex);
        regexMap.push(matches[1]);
        
        var index = this.pattern_.indexOf(matches[0]);
        if (minIndex == undefined || (index != -1 && minIndex > index))
            minIndex = index;
    }
    
    if (this.opt_options_[jms.routing.Route.optionNames.EXTRA_PARAMETERS_AS_QUERY_STRING] == true)
    {
        routeRegex += '(.*)';
    }
    
    this.regex_ = new RegExp('^' + routeRegex + '$');
    this.regexMap_ = regexMap;
    this.staticPrefix_ = this.pattern_.substring(0, minIndex);
};

/**
 * Initializes some options, can be called multiple times
 * without side-effects
 * @private
 */
jms.routing.Route.prototype.initializeOptions_ = function() {
    var options = {};
    options[jms.routing.Route.optionNames.SUFFIX] =  '';
    options[jms.routing.Route.optionNames.VARIABLE_PREFIXES] = [':'];
    options[jms.routing.Route.optionNames.SEGMENT_SEPARATORS] = ['/', '.'];
    options[jms.routing.Route.optionNames.VARIABLE_REGEX] = '[\\w\\d_]+';
    options[jms.routing.Route.optionNames.TEXT_REGEX] = '.+?';
    options[jms.routing.Route.optionNames.GENERATE_SHORTEST_URL] = true;
    options[jms.routing.Route.optionNames.EXTRA_PARAMETERS_AS_QUERY_STRING] = true;
    goog.object.extend(options, this.opt_options_);
    
    options[jms.routing.Route.optionNames.VARIABLE_PREFIXES_REGEX] = '(?:' 
        + goog.array.map(options[jms.routing.Route.optionNames.VARIABLE_PREFIXES], function(value, index, obj) {
            return goog.string.regExpEscape(value);
          }, this).join('|')
        + ')';
    
    if (options[jms.routing.Route.optionNames.SEGMENT_SEPARATORS].length > 0)
    {
        options[jms.routing.Route.optionNames.SEGMENT_SEPARATORS_REGEX] = '(?:'
            + goog.array.map(options[jms.routing.Route.optionNames.SEGMENT_SEPARATORS], function(value, index, obj) {
                return goog.string.regExpEscape(value);
              }, this).join('|')
            + ')';
        
        options[jms.routing.Route.optionNames.VARIABLE_CONTENT_REGEX] = '([^'
            + goog.array.map(options[jms.routing.Route.optionNames.SEGMENT_SEPARATORS], function(value, index, obj) {
                return goog.string.regExpEscape(value);
              }, this).join()
            + ']+)';
    }
    else
    {
        options[jms.routing.Route.optionNames.SEGMENT_SEPARATORS_REGEX] = '()';
        options[jms.routing.Route.optionNames.VARIABLE_CONTENT_REGEX] = '(.+)';
    }
    
    if (options[jms.routing.Route.optionNames.EXTRA_PARAMETERS_AS_QUERY_STRING] == true)
    {
        options[jms.routing.Route.optionNames.EXTRA_PARAMETERS_REGEX] = 
            options[jms.routing.Route.optionNames.SEGMENT_SEPARATORS_REGEX]
            + options[jms.routing.Route.optionNames.VARIABLE_CONTENT_REGEX]
            + options[jms.routing.Route.optionNames.SEGMENT_SEPARATORS_REGEX]
            + options[jms.routing.Route.optionNames.VARIABLE_CONTENT_REGEX];
    }
    
    this.opt_options_ = options;
};

/**
 * Fixes some requirement pitfalls; can be called multiple
 * times without causing side-effects
 * @private
 */
jms.routing.Route.prototype.fixRequirements_ = function() {
    goog.object.forEach(this.opt_requirements_, function(value, key, obj) {
        if (goog.string.startsWith(value, '^'))
            value = value.substring(1);
        
        if (goog.string.endsWith(value, '$'))
            value = value.substring(0, value.length-1);
        
        this.opt_requirements_[key] = value;
    }, this);
};

/**
 * Returns the value of the given parameter.
 * @param {string} name
 * @param {*} opt_default
 * @return {*}
 */
jms.routing.Route.prototype.getParameter = function(name, opt_default) {
    if (goog.DEBUG)
    {
        if (this.isBound_ == false)
            throw new Error('The route is not bound to any parameters.');
        
        if (!(name in this.parameters_) && goog.isDef(opt_default) == false)
            throw new Error('The parameter "' + name + '" does not exist.');
    }
    
    return name in this.parameters_ ? this.parameters_[name] : opt_default;
};

/**
 * Whether the route has the given parameter or not.
 * @param {string} name The name of the parameter to check
 * @return {boolean}
 */
jms.routing.Route.prototype.hasParameter = function(name) {
    if (goog.DEBUG) 
    {
        if (this.isBound_ == false)
            throw new Error('The route is not bound to any parameters.');
    }
    
    return name in this.parameters_;
};