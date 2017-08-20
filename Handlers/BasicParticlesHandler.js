define(['Handlers/Handler', 'Custom Utility/getVerticesUnNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/Timer'], function(Handler, getVerticesUnNormalized, getGLCoordsFromNormalizedShaderCoords, Timer){
    
    function BasicParticlesHandler(shouldDraw, numParticles, canvasWidth, canvasHeight, gl, zOrder, x, y, opts, ShaderLibrary){
        Handler.call(this, shouldDraw, 0, 0, zOrder, canvasWidth, canvasHeight);
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.PARTICLE);
        this._numParticles = numParticles;
        this._time = 1;
        
        this._uniforms = {
            iResolution: {
                type: "vec2",
                value: [canvasWidth, canvasHeight]
            },
            particleFX: {
                type: "float",
                value: [1.0]
            },
            iGlobalTime: {
                type: "float",
                value: [1.0]
            },
            center: {
                type: "vec2",
                value: [800, 500]
            },
            radius: {
                type: "float",
                value: [50]
            },
            maxLifetime: {
                type: "float",
                value: [50]
            },
            velocityMagnitude: {
                type: "float",
                value: [3]
            },
            accelerationMagnitude: {
                type: "float",
                value: [0.0]
            },
            particlesColor: {
                type: "vec3",
                value: [1.0, 1.0, 1.0]
            }
        };  
        
        for(var option in opts){
            for(var uniform in this._uniforms){
                if(option === uniform){
                    this._uniforms[uniform].value = opts[option];
                }
            }
        }
        
        var randVals = [];
        for(var i = 0; i < numParticles; i++){
            var randomVal = Math.random();
            for(var a = 0; a < 24; a++){
                randVals.push(randomVal);
            }
        }        
        this._attributes.randVals = randVals;
        
        this.setPosition(x, y);
    }   
    
    //inherit from Handler
    BasicParticlesHandler.prototype = Object.create(Handler.prototype);
    BasicParticlesHandler.prototype.constructor = BasicParticlesHandler;
    
    
    BasicParticlesHandler.prototype.update = function(){
        if(this._time <= this._uniforms.maxLifetime.value[0]){
            this._time++;
            this._uniforms.iGlobalTime.value[0] = this._time;
        }else{
            this._shouldDraw = false;
        }   
    }
    
    BasicParticlesHandler.prototype.doEffect = function(){
        this._time = 1;
        this._shouldDraw = true;
    }
    
    
    BasicParticlesHandler.prototype.setPosition = function(newX, newY){
        this._uniforms.center.value[0] = newX;
        this._uniforms.center.value[1] = newY;
        this._generateVerticesFromCurrentState();
    }
    
    BasicParticlesHandler.prototype.setParticlesColor = function(r, g, b){
        this._uniforms.particlesColor.value = [r, g, b];
    }

    
    BasicParticlesHandler.prototype._generateVerticesFromCurrentState = function(){        
        var radius_t = this._uniforms.radius.value[0] * 1.5;
        var centerX = this._uniforms.center.value[0];
        var centerY = this._uniforms.center.value[1];
        
        this._attributes.vertexPosition = [];
        for(var i = 0; i < this._numParticles; i++){
            this._attributes.vertexPosition = this._attributes.vertexPosition.concat( getVerticesUnNormalized(centerX - radius_t, centerY - radius_t, radius_t * 2, radius_t * 2, this._canvasWidth, this._canvasHeight) );
        }
    }

    return BasicParticlesHandler;
});