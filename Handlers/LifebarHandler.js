define(['Handlers/Handler', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/Vector'], function(Handler, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords, Vector){
    
    function LifebarHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, x1, y1, x2, y2, opts, ShaderLibrary){        
        this._uniforms = {
            iResolution: {
                type: "vec2",
                value: [canvasWidth, canvasHeight]
            },
            startCoord: {
                type: "vec2",
                value: [500.0, 475.0]
            },
            endCoord: {
                type: "vec2",
                value: [960.0, 575.0]
            },
            glowFactor: {
                type: "float",
                value: [2.0] 
            },
            lifeBarColor: {
                type: "vec3",
                value: [1.0, 1.0, 0.3]
            },
            lifeBarBackgroundColor: {
                type: "vec3",
                value: [0.0, 0.3, 1.0]
            },
            completion: {
                type: "float",
                value: [1.0]
            },
        };
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.LIFEBAR); 
        
        Handler.call(this, shouldDraw, 0, 0, zOrder, gl, canvasWidth, canvasHeight, opts);   
        
        this._padding = canvasHeight * 0.01;
        this.setCoords(x1, y1, x2, y2);
    }
    
    //inherit from Handler
    LifebarHandler.prototype = Object.create(Handler.prototype);
    LifebarHandler.prototype.constructor = LifebarHandler; 
    
    LifebarHandler.prototype.update = function(){ }
    
    LifebarHandler.prototype.setCoords = function(newX1, newY1, newX2, newY2){
        this._uniforms.startCoord.value = [newX1, newY1];
        this._uniforms.endCoord.value = [newX2, newY2];
        this._generateVerticesFromCurrentState();
    }
    
    LifebarHandler.prototype.setCompletion = function(completion){
        this._uniforms.completion.value[0] = completion;
    }

    LifebarHandler.prototype._generateVerticesFromCurrentState = function(){
        var startCoord = new Vector(this._uniforms.startCoord.value[0], this._uniforms.startCoord.value[1]);
        var endCoord = new Vector(this._uniforms.endCoord.value[0], this._uniforms.endCoord.value[1]);
        var width = (startCoord.subtractFrom(endCoord)).getMagnitude() + (this._padding * 2);
        var height = this._padding * 2;
        
        this._attributes.vertexPosition = getGLCoordsFromNormalizedShaderCoords( getVerticesNormalized(startCoord.getX() - this._padding, startCoord.getY() - this._padding, width, height, this._canvasWidth, this._canvasHeight) );
    }
    
    return LifebarHandler;
});