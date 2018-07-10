define(['Handlers/EntityHandler', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getVerticesUnNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getGLTextureForNoise',], function(EntityHandler, getVerticesNormalized, getVerticesUnNormalized, getGLCoordsFromNormalizedShaderCoords, getGLTextureForNoise){
    
    function TriangularTargetHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, position, opts, ShaderLibrary, noiseTextureData){        
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
            angle: {
                type: "float",
                value: [0] 
            },
            lgGlowFactor: {
                type: "float",
                value: [3.0]
            },
            guardPref: {
                type: "vec3",
                value: [0.0, 0.0, 0.0]
            },
            lgBool: {
                type: "float",
                value: [1.0]
            },       
            autoRotationBool: {
                type: "float",
                value: [0.0]
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
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.TRIANGULAR_TARGET); 
        
        EntityHandler.call(this, shouldDraw, gl, zOrder, position, canvasWidth, canvasHeight, ShaderLibrary, opts);   
        
        this.setPosition(position);
    }
    
    //inherit from Handler
    TriangularTargetHandler.prototype = Object.create(EntityHandler.prototype);
    TriangularTargetHandler.prototype.constructor = TriangularTargetHandler; 
    
    TriangularTargetHandler.prototype.setPosition = function(newPosition){
        this._uniforms.center.value[0] = newPosition.getX();
        this._uniforms.center.value[1] = newPosition.getY();
        this._generateVerticesFromCurrentState();
    }
    
    TriangularTargetHandler.prototype.setAngle = function(newAngle){
        this._uniforms.angle.value = [newAngle];
    }
    
    TriangularTargetHandler.prototype.setGuardPrefs = function(guardPrefs){
        this._uniforms.guardPref.value = guardPrefs;
    }
    
    TriangularTargetHandler.prototype.increaseLgGlowFactor = function(lgGlowFactor){
        this._uniforms.lgGlowFactor.value[0] += lgGlowFactor;
    }
    
    TriangularTargetHandler.prototype.setCapturedToTrue = function(){
        this._uniforms.capturedBool.value = [1.0];
    }    
    
    TriangularTargetHandler.prototype.setCapturedToFalse = function(){
        this._uniforms.capturedBool.value = [0.0];
    }
    
    TriangularTargetHandler.prototype._generateVerticesFromCurrentState = function(){
        var radius_t = this._uniforms.radius.value[0] * 1.5;
        var centerX = this._uniforms.center.value[0];
        var centerY = this._uniforms.center.value[1];

        this._attributes.vertexPosition = getGLCoordsFromNormalizedShaderCoords( getVerticesNormalized(centerX - radius_t, centerY - radius_t, radius_t * 2, radius_t * 2, this._canvasWidth, this._canvasHeight) );
        
       // this._attributes.vertexPosition = getVerticesUnNormalized(centerX - radius_t, centerY - radius_t, radius_t * 2, radius_t * 2, this._canvasWidth, this._canvasHeight);
    }
    
    return TriangularTargetHandler;
});