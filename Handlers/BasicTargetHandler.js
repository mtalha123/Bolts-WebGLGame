define(['Handlers/EntityHandler', 'Custom Utility/getVerticesUnNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getGLTextureForNoise'], function(EntityHandler, getVerticesUnNormalized, getGLCoordsFromNormalizedShaderCoords, getGLTextureForNoise){
    
    function TargetHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, position, opts, ShaderLibrary, noiseTextureData){        
        this._uniforms = {
            iResolution: {
                type: "vec2",
                value: [canvasWidth, canvasHeight]
            },
            iGlobalTime: {
                type: "float",
                value: [1.0]
            },
            fluctuation: {
                type: "float",
                value: [5.0]
            },
            lgLineWidth: {
                type: "float",
                value: [3.0]
            },
            lgGlowFactor: {
                type: "float",
                value: [4.0]
            },
            numBolts:{
                type: "float",
                value: [1.0]
            },
            boltColor: {
                type: "vec3",
                value: [1.0, 1.0, 0.0]
            },
            center: {
                type: "vec2",
                value: [960.0, 475.0]
            },
            radius: {
                type: "float",
                value: [150.0] 
            },
            circleLineWidth: {
                type: "float",
                value: [7.5]
            },
            circleGlowFactor: {
                type: "float",
                value: [8.0]
            },
            completion: {
                type: "float",
                value: [1.0]
            },
            rotationBool: {
                type: "float",
                value: [0.0]
            },
            spaceInCenterBool: {
                type: "float",
                value: [0.0]
            },
            capturedBool: {
                type: "float",
                value: [0.0]
            },
            noise: {
                type: "sampler2D",
                value: noiseTextureData.sampler,
                texture: noiseTextureData.noiseTexture
            }
        };
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.TARGET);
        
        EntityHandler.call(this, shouldDraw, gl,  zOrder, position, canvasWidth, canvasHeight, ShaderLibrary, opts);   
        
        this.setPosition(position);
    }
    
    //inherit from Handler
    TargetHandler.prototype = Object.create(EntityHandler.prototype);
    TargetHandler.prototype.constructor = TargetHandler; 
    
    TargetHandler.prototype.setNumBolts = function(numBolts){
        this._uniforms.numBolts.value = [numBolts];
    }    
    
    TargetHandler.prototype.setCapturedToTrue = function(){
        this._uniforms.capturedBool.value = [1.0];
    }    
    
    TargetHandler.prototype.setCapturedToFalse = function(){
        this._uniforms.capturedBool.value = [0.0];
    }
    
    return TargetHandler;
});