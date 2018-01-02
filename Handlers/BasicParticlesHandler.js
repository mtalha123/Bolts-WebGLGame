define(['Handlers/Handler', 'Custom Utility/getVerticesUnNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/Timer', 'Custom Utility/Vector'], function(Handler, getVerticesUnNormalized, getGLCoordsFromNormalizedShaderCoords, Timer, Vector){
    
    function BasicParticlesHandler(shouldDraw, numParticles, canvasWidth, canvasHeight, gl, zOrder, position, opts, ShaderLibrary){        
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
        
        this._shaderProgram = ShaderLibrary.requestProgram(ShaderLibrary.PARTICLE);
        
        Handler.call(this, shouldDraw, zOrder, gl, canvasWidth, canvasHeight, opts);
        
        this._numParticles = numParticles;
        
        var randVals = [];
        for(var i = 0; i < numParticles; i++){
            var randomVal = Math.random();
            for(var a = 0; a < 24; a++){
                randVals.push(randomVal);
            }
        }        
        this._attributes.randVals = randVals;
        
        this.additiveBlending = true;
        
        this._callback = undefined;
        
        this.setPosition(position);
    }   
    
    //inherit from Handler
    BasicParticlesHandler.prototype = Object.create(Handler.prototype);
    BasicParticlesHandler.prototype.constructor = BasicParticlesHandler;
    
    
    BasicParticlesHandler.prototype.update = function(){
        if((this._time <= this._uniforms.maxLifetime.value[0])){
            this._time++;
            this._uniforms.iGlobalTime.value[0] = this._time;
        }else{
            this._shouldDraw = false;
//            this._time = 1;
            if(this._callback){
                this._callback();
                this._callback = undefined;
            }
        }   
    }
    
    BasicParticlesHandler.prototype.doEffect = function(optCallback){
        this._callback = optCallback;
        this._time = 1;
        this._shouldDraw = true;
    }
    
    BasicParticlesHandler.prototype.reset = function(){
        this._callback = undefined;
        this._time = 1;
        this._shouldDraw = false;
    }
    
    
    BasicParticlesHandler.prototype.setPosition = function(newPosition){
        this._uniforms.center.value[0] = newPosition.getX();
        this._uniforms.center.value[1] = newPosition.getY();
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