define(['Handlers/EntityHandler', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getGLTextureForNoise', 'Handlers/BasicParticlesHandler'], function(EntityHandler, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords, getGLTextureForNoise, BasicParticlesHandler){
    
    function LightningOrbHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, x, y, opts, ShaderLibrary, noiseTextureData){         
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
                value: [7.5] 
            },
            lineLength: {
                type: "float",
                value: [30.0] 
            },
            lgGlowFactor: {
                type: "float",
                value: [1.0] 
            },
            lightningOn: {
                type: "float",
                value: [0.0] 
            },
            noise: {
                type: "sampler2D",
                value: noiseTextureData.sampler,
                texture: noiseTextureData.noiseTexture
            }
        };
        
        EntityHandler.call(this, shouldDraw, gl, 0, 0, zOrder, canvasWidth, canvasHeight, ShaderLibrary, opts); 
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.LIGHTNING_ORB); 
        
        this.setPosition(x, y);
    }
    
    //inherit from Handler
    LightningOrbHandler.prototype = Object.create(EntityHandler.prototype);
    LightningOrbHandler.prototype.constructor = LightningOrbHandler; 
    
    LightningOrbHandler.prototype.setPosition = function(newX, newY){
        this._uniforms.center.value[0] = newX;
        this._uniforms.center.value[1] = newY;
        this._generateVerticesFromCurrentState();
    }
    
    LightningOrbHandler.prototype.turnOffLightning = function(){
        this._uniforms.lightningOn.value = [0.0];
    }
        
    LightningOrbHandler.prototype.turnOnLightning = function(){
        this._uniforms.lightningOn.value = [1.0];
    }

    LightningOrbHandler.prototype._generateVerticesFromCurrentState = function(){
        var radius_t = this._uniforms.radius.value[0] + (this._uniforms.lineLength.value[0] * 2.5);
        var centerX = this._uniforms.center.value[0];
        var centerY = this._uniforms.center.value[1];

        this._attributes.vertexPosition = getGLCoordsFromNormalizedShaderCoords( getVerticesNormalized(centerX - radius_t, centerY - radius_t, radius_t * 2, radius_t * 2, this._canvasWidth, this._canvasHeight) );
    }
    
    return LightningOrbHandler;
});