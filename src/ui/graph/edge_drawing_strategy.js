goog.provide('jms.ui.graph.EdgeDrawingStrategy');

goog.require('goog.graphics.AbstractGraphics');
goog.require('goog.ui.Component');
goog.require('jms.structs.DirectedGraph');

/**
 * @interface
 */
jms.ui.graph.EdgeDrawingStrategy = function() {};

/**
 * @param {!goog.graphics.AbstractGraphics} graphics
 * @param {!jms.structs.DirectedGraph} graph
 * @param {!goog.ui.Component} nodeArea
 */
jms.ui.graph.EdgeDrawingStrategy.prototype.drawEdges = goog.nullFunction;