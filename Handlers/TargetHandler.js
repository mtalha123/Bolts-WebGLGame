define(['Handlers/EntityHandler', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getGLTextureForNoise', 'Handlers/BasicParticlesHandler'], function(EntityHandler, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords, getGLTextureForNoise, BasicParticlesHandler){
    
    function TargetHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, x, y, opts, ShaderLibrary, noiseTextureData){
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
                value: [5.0]
            },
            boltColor: {
                type: "vec3",
                value: [1.0, 1.0, 0.0]
            },
            glowColor: {
                type: "vec3",
                value: [1.0, 1.0, 0.7]
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
            noise: {
                type: "sampler2D",
                value: noiseTextureData.sampler,
                texture: noiseTextureData.noiseTexture
            }
        };
        
        EntityHandler.call(this, shouldDraw, gl, 0, 0, zOrder, canvasWidth, canvasHeight, ShaderLibrary, opts);   
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.TARGET);
        
        this.setPosition(x, y);
    }
    
    //inherit from Handler
    TargetHandler.prototype = Object.create(EntityHandler.prototype);
    TargetHandler.prototype.constructor = TargetHandler; 
    
    TargetHandler.prototype.setPosition = function(newX, newY){
        this._uniforms.center.value[0] = newX;
        this._uniforms.center.value[1] = newY;
        this._generateVerticesFromCurrentState();
    }
    
    TargetHandler.prototype.increaseLgGlowFactor = function(newGlowFactor){
        this._uniforms.lgGlowFactor.value[0] += newGlowFactor;
    }
    
    TargetHandler.prototype.setNumBolts = function(numBolts){
        this._uniforms.numBolts.value = [numBolts];
    }
    
    TargetHandler.prototype._generateVerticesFromCurrentState = function(){
        var radius_t = (this._uniforms.radius.value[0] + this._uniforms.circleLineWidth.value[0] + this._uniforms.circleGlowFactor.value[0]) * 1.3;
        var centerX = this._uniforms.center.value[0];
        var centerY = this._uniforms.center.value[1];

        this._attributes.vertexPosition = getGLCoordsFromNormalizedShaderCoords( getVerticesNormalized(centerX - radius_t, centerY - radius_t, radius_t * 2, radius_t * 2, this._canvasWidth, this._canvasHeight) );
    }
    
    return TargetHandler;
});