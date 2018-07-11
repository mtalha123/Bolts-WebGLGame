define(['Handlers/Handler', 'Handlers/LightningHandler', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/Vector'], function(Handler, LightningHandler, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords, Vector){
    
    function SliceHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, startPos, endPos, opts, ShaderLibrary, noiseTextureData, coordsSamplerVal){        
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
            completion: {
                type: "float",
                value: [1.0]
            },
        };
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.LIFEBAR); 
        
        Handler.call(this, shouldDraw, zOrder, gl, canvasWidth, canvasHeight, opts); 
        
        this._lightningHandler = new LightningHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, {}, [startPos.getX(), startPos.getY(), endPos.getX(), endPos.getY()], ShaderLibrary, noiseTextureData, coordsSamplerVal);
        
        this._padding = canvasHeight * 0.01;
        this.setCoords(startPos, endPos);
    }
    
    //inherit from Handler
    SliceHandler.prototype = Object.create(Handler.prototype);
    SliceHandler.prototype.constructor = SliceHandler; 
    
    SliceHandler.prototype.update = function(){ }
    
    SliceHandler.prototype.setCoords = function(newStartPos, newEndPos){
        this._uniforms.startCoord.value = [newStartPos.getX(), newStartPos.getY()];
        this._uniforms.endCoord.value = [newEndPos.getX(), newEndPos.getY()];
        this._generateVerticesFromCurrentState();
    }
    
    SliceHandler.prototype.setCompletion = function(completion){
        this._uniforms.completion.value[0] = completion;
    }

    SliceHandler.prototype._generateVerticesFromCurrentState = function(){
        var startCoord = new Vector(this._uniforms.startCoord.value[0], this._uniforms.startCoord.value[1]);
        var endCoord = new Vector(this._uniforms.endCoord.value[0], this._uniforms.endCoord.value[1]);
        var width = (endCoord.subtract(startCoord)).getMagnitude() + (this._padding * 2);
        var height = this._padding * 2;
        
        this._attributes.vertexPosition.value = getGLCoordsFromNormalizedShaderCoords( getVerticesNormalized(startCoord.getX() - this._padding, startCoord.getY() - this._padding, width, height, this._canvasWidth, this._canvasHeight) );
    }
    
    return SliceHandler;
});