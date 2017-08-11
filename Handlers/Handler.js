define(['Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords'], function(getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords){ 
    function Handler(shouldDraw, x, y, zOrder, canvasWidth, canvasHeight){
        this._shouldDraw = shouldDraw;
        this._x = x;
        this._y = y;
        this._width = 300;
        this._height = 300;
        this._uniforms = {};
        this._attributes = {
            vertexPosition: []
        };
        this._canvasWidth = canvasWidth;
        this._canvasHeight = canvasHeight;
        this._shaderProgram = null;
        this._zOrder = zOrder;
        this._handlers = [this];
        this._time = 1;
    }
    
    Handler.prototype.shouldDraw = function(shouldDrawOrNot){
        this._shouldDraw = shouldDrawOrNot;
    }
    
    Handler.prototype.getUniforms = function(){
        return this._uniforms;
    }
    
    Handler.prototype.getAttributes = function(){
        return this._attributes;
    }
    
    Handler.prototype.getNumVertices = function(){
        return this._attributes.vertexPosition.length / 2;
    }
    
    Handler.prototype.getShaderProgram = function(){
        return this._shaderProgram;
    }
    
    Handler.prototype.getZOrder = function(){
        return this._zOrder;
    }
    
    Handler.prototype.getAllHandlers = function(){
        return this._handlers;
    }
    
    Handler.prototype.update = function(){
        this._time++;
        this._uniforms.iGlobalTime.value[0] = this._time;
    }
    
    return Handler;
});