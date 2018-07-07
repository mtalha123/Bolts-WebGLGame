define(['Handlers/Handler', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getGLTextureForImage'], function(Handler, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords, getGLTextureForImage){
    
    function ComboHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, position, opts, ShaderLibrary, effectTextureData){        
        this._uniforms = {
            iResolution: {
                type: "vec2",
                value: [canvasWidth, canvasHeight]
            },
            completion: {
                type: "float",
                value: [0.5]
            },
            iGlobalTime: {
                type: "float",
                value: [0]
            },
            center: {
                type: "vec2",
                value: [300, 500]
            },
            radius: {
                type: "float",
                value: [50]
            },
            spreadOfEdgeEffect: {
                type: "float",
                value: [10]
            },
            effectTexture: {
                type: "sampler2D",
                value: effectTextureData.sampler,
                texture: effectTextureData.effectTexture
            },
        };
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.COMBO);

        Handler.call(this, shouldDraw, zOrder, gl, canvasWidth, canvasHeight, opts);
        this.setPosition(position);
    }
    
    //inherit from Handler
    ComboHandler.prototype = Object.create(Handler.prototype);
    ComboHandler.prototype.constructor = ComboHandler; 
    
    ComboHandler.prototype.setPosition = function(newPosition){        
        this._uniforms.center.value = [newPosition.getX(), newPosition.getY()];
        this._generateVerticesFromCurrentState();
    }
    
    ComboHandler.prototype.setCompletion = function(completionVal){
        this._uniforms.completion.value = [completionVal];
    }
    
    ComboHandler.prototype._generateVerticesFromCurrentState = function(){
        var radius_t = (this._uniforms.radius.value[0] + this._uniforms.spreadOfEdgeEffect.value[0]) * 1.3;
        var centerX = this._uniforms.center.value[0];
        var centerY = this._uniforms.center.value[1];

        this._attributes.vertexPosition = getGLCoordsFromNormalizedShaderCoords( getVerticesNormalized(centerX - radius_t, centerY - radius_t, radius_t * 2, radius_t * 2, this._canvasWidth, this._canvasHeight));
    }

    return ComboHandler;
});