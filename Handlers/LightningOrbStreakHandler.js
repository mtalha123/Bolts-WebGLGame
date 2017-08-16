define(['Handlers/Handler', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/getGLTextureForNoise', 'Handlers/BasicParticlesHandler'], function(Handler, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords, getGLTextureForNoise, BasicParticlesHandler){
    
    function LightningOrbStreakHandler(shouldDraw, canvasWidth, canvasHeight, gl, zOrder, x, y, opts, ShaderLibrary, noiseTextureData){
        Handler.call(this, shouldDraw, 0, 0, zOrder, canvasWidth, canvasHeight);   
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.ORB_LIGHTNING_STREAK); 
                
        this._particlesHandler = new BasicParticlesHandler(false, 50, canvasWidth, canvasHeight, gl, zOrder-1, x, y, opts, ShaderLibrary);
        this._handlers.push(this._particlesHandler);
       
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
                value: [1.0] 
            },
            particleGlowFactor: {
                type: "float",
                value: [4.0] 
            },
            circleGlowFactor: {
                type: "float",
                value: [3.0] 
            },
            noise: {
                type: "sampler2D",
                value: noiseTextureData.sampler,
                texture: noiseTextureData.noiseTexture
            }
        };
        
        //clone uniforms
        this._uniformsDefault = {};
        for(var uniform in this._uniforms){
            if(uniform === "noise"){
                continue;
            }
            
            this._uniformsDefault[uniform] = {value: []};
            for(var i = 0; i < this._uniforms[uniform].value.length; i++){
                this._uniformsDefault[uniform].value[i] = this._uniforms[uniform].value[i];
            }
        }        
        
        for(var option in opts){
            for(var uniform in this._uniforms){
                if(option === uniform){
                    this._uniforms[uniform].value = opts[option];
                    
                    //make sure copied by value instead of by reference
                    for(var i = 0; i < opts[option].length; i++){
                        this._uniformsDefault[option].value[i] = opts[option][i];
                    }
                }
            }
        }
        
        this.setPosition(x, y);
    }
    
    //inherit from Handler
    LightningOrbStreakHandler.prototype = Object.create(Handler.prototype);
    LightningOrbStreakHandler.prototype.constructor = LightningOrbStreakHandler; 
    
    LightningOrbStreakHandler.prototype.update = function(){
        Handler.prototype.update.call(this);   
        this._particlesHandler.update();
    }
    
    LightningOrbStreakHandler.prototype.setPosition = function(newX, newY){
        this._uniforms.center.value[0] = newX;
        this._uniforms.center.value[1] = newY;
        this._generateVerticesFromCurrentState();
    }
    
    LightningOrbStreakHandler.prototype.setRadius = function(newRadius){
        this._uniforms.radius.value = [newRadius];
        this._generateVerticesFromCurrentState();
    }
    
    LightningOrbStreakHandler.prototype.doSpawnEffect = function(x, y){
        this._particlesHandler.setPosition(x, y);
        this._particlesHandler.doEffect();
        this._particlesHandler.setParticlesColor(0.0, 0.3, 1.0);
        this._shouldDraw = true;
    }
    
    LightningOrbStreakHandler.prototype.doDestroyEffect = function(x, y){
        this._particlesHandler.setPosition(x, y);
        this._particlesHandler.doEffect();
        this._particlesHandler.setParticlesColor(1.0, 1.0, 0.5);
        this._shouldDraw = false;
    }
    
    LightningOrbStreakHandler.prototype.increaseGlow = function(amount){
        this._uniforms.lgGlowFactor.value[0] += amount;
        this._uniforms.particleGlowFactor.value[0] += amount;
        this._uniforms.circleGlowFactor.value[0] += amount;
    }
    
    LightningOrbStreakHandler.prototype.resetProperties = function(opts){
        this._setToDefaultUniforms(opts);
    }

    LightningOrbStreakHandler.prototype._generateVerticesFromCurrentState = function(){
        var radius_t = this._uniforms.radius.value[0] * 1.3;
        var centerX = this._uniforms.center.value[0];
        var centerY = this._uniforms.center.value[1];

        this._attributes.vertexPosition = getGLCoordsFromNormalizedShaderCoords( getVerticesNormalized(centerX - radius_t, centerY - radius_t, radius_t * 2, radius_t * 2, this._canvasWidth, this._canvasHeight) );
    }
    
    LightningOrbStreakHandler.prototype._setToDefaultUniforms = function(opts){
        for(var uniform in this._uniformsDefault){
            for(var i = 0; i < this._uniformsDefault[uniform].value.length; i++){
                this._uniforms[uniform].value[i] = this._uniformsDefault[uniform].value[i];
            }
        }
    }
    
    return LightningOrbStreakHandler;
});