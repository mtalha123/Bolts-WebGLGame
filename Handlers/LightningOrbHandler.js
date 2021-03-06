define(['Handlers/EntityHandler', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getGLTextureForNoise'], function(EntityHandler, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords, getGLTextureForNoise){
    
    function LightningOrbHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, position, opts, ShaderLibrary, noiseTextureData){         
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
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.LIGHTNING_ORB); 
        
        EntityHandler.call(this, shouldDraw, gl, zOrder, position, canvasWidth, canvasHeight, ShaderLibrary, opts); 
        this._radiusMultiplierForGenVertices = 2.5;
        this.setPosition(position);
    }
    
    //inherit from Handler
    LightningOrbHandler.prototype = Object.create(EntityHandler.prototype);
    LightningOrbHandler.prototype.constructor = LightningOrbHandler; 
    
    LightningOrbHandler.prototype.turnOffLightning = function(){
        this._uniforms.lightningOn.value = [0.0];
    }
        
    LightningOrbHandler.prototype.turnOnLightning = function(){
        this._uniforms.lightningOn.value = [1.0];
    }
    
    return LightningOrbHandler;
});