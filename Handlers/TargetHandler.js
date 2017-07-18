define(['Handlers/Handler', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getGLTextureForNoise'], function(Handler, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords, getGLTextureForNoise){
    
    function TargetHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, x, y, opts, ShaderLibrary, noiseTextureData){
        Handler.call(this, shouldDraw, 0, 0, zOrder, canvasWidth, canvasHeight);   
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.TARGET);
       
        this._uniforms = {
            iResolution: {
                type: "vec2",
                value: [canvasWidth, canvasHeight]
            },
            iGlobalTime: {
                type: "float",
                value: [1]
            },
            fluctuation: {
                type: "float",
                value: [10.0]
            },
            glowFactor: {
                type: "float",
                value: [6.5]
            },
            lineWidth: {
                type: "float",
                value: [2.0]
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
                value: [960, 475]
            },
            radius: {
                type: "float",
                value: [150] 
            },
            circleLineWidth: {
                type: "float",
                value: [10]
            },
            circleGlowFactor: {
                type: "float",
                value: [40]
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
        
        for(var option in opts){
            for(var uniform in this._uniforms){
                if(option === uniform){
                    this._uniforms[uniform].value = opts[option];
                }
            }
        }
        
        this.setPosition(x, y);
        //this._generateVerticesFromCurrentState();
    }
    
    //inherit from Handler
    TargetHandler.prototype = Object.create(Handler.prototype);
    TargetHandler.prototype.constructor = TargetHandler; 
    
    TargetHandler.prototype.setPosition = function(newX, newY){
        this._uniforms.center.value[0] = newX + this._uniforms.radius.value[0];
        this._uniforms.center.value[1] = newY - this._uniforms.radius.value[0];
        this._generateVerticesFromCurrentState();
    }
    
    TargetHandler.prototype.setFluctuation = function(newFluctutation){
        this._uniforms.fluctuation.value = [newFluctuation];
    }
    
    TargetHandler.prototype.setLightningGlowSize = function(newGlowFactor){
        this._uniforms.glowFactor.value = [newGlowFactor];
    }
    
    TargetHandler.prototype.setLightningLineWidth = function(newLineWidth){
        this._uniforms.lineWidth.value = [newLineWidth];
    }
    
    TargetHandler.prototype.setTime = function(newTime){
        this._uniforms.iGlobalTime.value = [newTime];
    }
    
    TargetHandler.prototype.setGlowColor = function(newGlowColor){
        this._uniforms.glowColor.value = newGlowColor;
    }
    
    TargetHandler.prototype.setLightningBoltsColor = function(newBoltColor){
        this._uniforms.boltColor.value = newBoltColor;
    }
    
    TargetHandler.prototype.setLightningGlowColor = function(newGlowColor){
        this._uniforms.glowColor.value = newGlowColor;
    }
    
    TargetHandler.prototype.setRadius = function(newRadius){
        this._uniforms.radius.value = [newRadius];
        this._generateVerticesFromCurrentState();
    }
    
    TargetHandler.prototype.setCircleGlowFactor = function(newGlowFactor){
        this._uniforms.setCircleGlowFactor.value = [newGlowFactor];
        this._generateVerticesFromCurrentState();
    }
    
    TargetHandler.prototype.setCompletion = function(value){
        this._uniforms.completion.value = [value];
    }
    
    TargetHandler.prototype._generateVerticesFromCurrentState = function(){
        var radius_t = this._uniforms.radius.value[0] + this._uniforms.circleLineWidth.value[0] + this._uniforms.circleGlowFactor.value[0];
        var centerX = this._uniforms.center.value[0];
        var centerY = this._uniforms.center.value[1];

        this._attributes.vertexPosition = getGLCoordsFromNormalizedShaderCoords( getVerticesNormalized(centerX - radius_t, centerY - radius_t, radius_t * 2, radius_t * 2, this._canvasWidth, this._canvasHeight) );
    }
    
    return TargetHandler;
});