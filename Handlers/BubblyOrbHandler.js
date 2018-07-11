define(['Handlers/EntityHandler', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getGLTextureForNoise'], function(EntityHandler, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords, getGLTextureForNoise){
    
    function BubblyOrb(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, position, opts, ShaderLibrary, noiseTextureData){
        this._uniforms = {
            iResolution: {
                type: "vec2",
                value: [canvasWidth, canvasHeight]
            },
            iGlobalTime: {
                type: "float",
                value: [1.0]
            },
            center: {
                type: "vec2",
                value: [960.0, 475.0]
            },
            radius: {
                type: "float",
                value: [60] 
            },
            particleGlowFactor: {
                type: "float",
                value: [4.0] 
            },
            circleGlowFactor: {
                type: "float",
                value: [3.0] 
            },
            particlesBool: {
                type: "float",
                value: [1.0] 
            },
            noise: {
                type: "sampler2D",
                value: noiseTextureData.sampler,
                texture: noiseTextureData.noiseTexture
            }
        };
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.BUBBLY_ORB); 
        
        EntityHandler.call(this, shouldDraw, gl, zOrder, position, canvasWidth, canvasHeight, ShaderLibrary, opts);  
        
        this.setPosition(position);
    }
    
    //inherit from Handler
    BubblyOrb.prototype = Object.create(EntityHandler.prototype);
    BubblyOrb.prototype.constructor = BubblyOrb; 
    
    BubblyOrb.prototype.setPosition = function(newPosition){
        this._uniforms.center.value[0] = newPosition.getX();
        this._uniforms.center.value[1] = newPosition.getY();
        this._generateVerticesFromCurrentState();
    }

    BubblyOrb.prototype._generateVerticesFromCurrentState = function(){
        var radius_t = this._uniforms.radius.value[0] * 1.5;
        var centerX = this._uniforms.center.value[0];
        var centerY = this._uniforms.center.value[1];

        this._attributes.vertexPosition.value = getGLCoordsFromNormalizedShaderCoords( getVerticesNormalized(centerX - radius_t, centerY - radius_t, radius_t * 2, radius_t * 2, this._canvasWidth, this._canvasHeight) );
    }
    
    return BubblyOrb;
});