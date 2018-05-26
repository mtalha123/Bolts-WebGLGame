define(['Handlers/EntityHandler', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getGLTextureForNoise', 'Handlers/BasicParticlesHandler'], function(EntityHandler, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords, getGLTextureForNoise, BasicParticlesHandler){
    
    function LightningOrbStreakHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, position, opts, ShaderLibrary, noiseTextureData){       
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
            lgGlowFactor: {
                type: "float",
                value: [3.0] 
            },
            particleGlowFactor: {
                type: "float",
                value: [4.0] 
            },
            circleGlowFactor: {
                type: "float",
                value: [5.0] 
            },
            lightningTurnedOn: {
                type: "float",
                value: [1.0] 
            },
            noise: {
                type: "sampler2D",
                value: noiseTextureData.sampler,
                texture: noiseTextureData.noiseTexture
            }
        };
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.ORB_LIGHTNING_STREAK);
        
        EntityHandler.call(this, shouldDraw, gl, zOrder, position, canvasWidth, canvasHeight, ShaderLibrary, opts);    
        
        this.setPosition(position);
    }
    
    //inherit from Handler
    LightningOrbStreakHandler.prototype = Object.create(EntityHandler.prototype);
    LightningOrbStreakHandler.prototype.constructor = LightningOrbStreakHandler; 
    
    LightningOrbStreakHandler.prototype.setPosition = function(newPosition){
        this._uniforms.center.value[0] = newPosition.getX();
        this._uniforms.center.value[1] = newPosition.getY();
        this._generateVerticesFromCurrentState();
    }    
    
    LightningOrbStreakHandler.prototype.setLightningState = function(state){
        if(state){
            this._uniforms.lightningTurnedOn.value[0] = 1.0;
        }else{
            this._uniforms.lightningTurnedOn.value[0] = 0.0;
        }
    }

    LightningOrbStreakHandler.prototype._generateVerticesFromCurrentState = function(){
        var radius_t = this._uniforms.radius.value[0] * 1.5;
        var centerX = this._uniforms.center.value[0];
        var centerY = this._uniforms.center.value[1];

        this._attributes.vertexPosition = getGLCoordsFromNormalizedShaderCoords( getVerticesNormalized(centerX - radius_t, centerY - radius_t, radius_t * 2, radius_t * 2, this._canvasWidth, this._canvasHeight) );
    }
    
    return LightningOrbStreakHandler;
});