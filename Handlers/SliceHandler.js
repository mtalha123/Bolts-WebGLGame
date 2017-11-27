define(['Handlers/Handler', 'Handlers/LightningHandler', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/Vector'], function(Handler, LightningHandler, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords, Vector){
    
    function SliceHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, x1, y1, x2, y2, opts, ShaderLibrary, noiseTextureData, coordsSamplerVal){        
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
        
        Handler.call(this, shouldDraw, 0, 0, zOrder, gl, canvasWidth, canvasHeight, opts); 
        
        this._lightningHandler = new LightningHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, {}, [x1, y1, x2, y2], ShaderLibrary, noiseTextureData, coordsSamplerVal);
        
        this._padding = canvasHeight * 0.01;
        this.setCoords(x1, y1, x2, y2);
    }
    
    //inherit from Handler
    SliceHandler.prototype = Object.create(Handler.prototype);
    SliceHandler.prototype.constructor = SliceHandler; 
    
    SliceHandler.prototype.update = function(){ }
    
    SliceHandler.prototype.setCoords = function(newX1, newY1, newX2, newY2){
        this._uniforms.startCoord.value = [newX1, newY1];
        this._uniforms.endCoord.value = [newX2, newY2];
        this._generateVerticesFromCurrentState();
    }
    
    SliceHandler.prototype.setCompletion = function(completion){
        this._uniforms.completion.value[0] = completion;
    }

    SliceHandler.prototype._generateVerticesFromCurrentState = function(){
        var startCoord = new Vector(this._uniforms.startCoord.value[0], this._uniforms.startCoord.value[1]);
        var endCoord = new Vector(this._uniforms.endCoord.value[0], this._uniforms.endCoord.value[1]);
        var width = (startCoord.subtractFrom(endCoord)).getMagnitude() + (this._padding * 2);
        var height = this._padding * 2;
        
        this._attributes.vertexPosition = getGLCoordsFromNormalizedShaderCoords( getVerticesNormalized(startCoord.getX() - this._padding, startCoord.getY() - this._padding, width, height, this._canvasWidth, this._canvasHeight) );
    }
    
    return SliceHandler;
});