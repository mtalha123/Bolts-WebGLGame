define(['Handlers/EntityHandler', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getGLTextureForNoise'], function(EntityHandler, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords, getGLTextureForNoise){
    
    function FourPointTargetHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, position, opts, ShaderLibrary, noiseTextureData){        
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
                value: [80] 
            },
            angle: {
                type: "float",
                value: [0] 
            },
            guardPref: {
                type: "vec4",
                value: [0.0, 0.0, 0.0, 0.0]
            },
            lgGlowFactor: {
                type: "float",
                value: [3.0]
            },
            capturedBool: {
                type: "float",
                value: [0]
            },
            noise: {
                type: "sampler2D",
                value: noiseTextureData.sampler,
                texture: noiseTextureData.noiseTexture
            }
        };
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.FOUR_POINT_TARGET);
        
        EntityHandler.call(this, shouldDraw, gl, zOrder, position, canvasWidth, canvasHeight, ShaderLibrary, opts);  
        
        this.setPosition(position);
    }
    
    //inherit from Handler
    FourPointTargetHandler.prototype = Object.create(EntityHandler.prototype);
    FourPointTargetHandler.prototype.constructor = FourPointTargetHandler; 

    FourPointTargetHandler.prototype.setAngle = function(newAngle){
        this._uniforms.angle.value = [newAngle];
    }
    
    FourPointTargetHandler.prototype.setGuardPrefs = function(guardPrefs){
        this._uniforms.guardPref.value = guardPrefs;
    }
    
    FourPointTargetHandler.prototype.increaseLgGlowFactor = function(lgGlowFactor){
        this._uniforms.lgGlowFactor.value[0] += lgGlowFactor;
    }
    
    FourPointTargetHandler.prototype.setCapturedToTrue = function(){
        this._uniforms.capturedBool.value = [1.0];
    }    
    
    FourPointTargetHandler.prototype.setCapturedToFalse = function(){
        this._uniforms.capturedBool.value = [0.0];
    }
    
    return FourPointTargetHandler;
});