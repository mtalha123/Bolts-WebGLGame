define(['Handlers/Handler', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/Vector'], function(Handler, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords, Vector){
    
    function LifebarHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, startPosition, endPosition, opts, ShaderLibrary){        
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
                value: [5.0] 
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
        
        Handler.call(this, shouldDraw, zOrder, gl, canvasWidth, canvasHeight, opts);   
        
        this._padding = canvasHeight * 0.06;
        this.setCoords(startPosition, endPosition);
    }
    
    //inherit from Handler
    LifebarHandler.prototype = Object.create(Handler.prototype);
    LifebarHandler.prototype.constructor = LifebarHandler; 
    
    LifebarHandler.prototype.update = function(){ }
    
    LifebarHandler.prototype.setCoords = function(newStartPos, newEndPos){
        this._uniforms.startCoord.value = [newStartPos.getX(), newStartPos.getY()];
        this._uniforms.endCoord.value = [newEndPos.getX(), newEndPos.getY()];
        this._generateVerticesFromCurrentState();
    }
    
    LifebarHandler.prototype.setCompletion = function(completion){
        this._uniforms.completion.value[0] = completion;
    }

    LifebarHandler.prototype._generateVerticesFromCurrentState = function(){
        var startCoord = new Vector(this._uniforms.startCoord.value[0], this._uniforms.startCoord.value[1]);
        var endCoord = new Vector(this._uniforms.endCoord.value[0], this._uniforms.endCoord.value[1]);
        var width = (endCoord.subtract(startCoord)).getMagnitude() + (this._padding * 2);
        var height = this._padding * 2;
        
        this._attributes.vertexPosition = getGLCoordsFromNormalizedShaderCoords( getVerticesNormalized(startCoord.getX() - this._padding, startCoord.getY() - this._padding, width, height, this._canvasWidth, this._canvasHeight) );
    }
    
    return LifebarHandler;
});