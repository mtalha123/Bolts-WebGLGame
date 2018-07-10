define(['Handlers/Handler', 'Custom Utility/getVerticesUnNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/Timer', 'Custom Utility/Vector', 'timingCallbacks'], function(Handler, getVerticesUnNormalized, getGLCoordsFromNormalizedShaderCoords, Timer, Vector, timingCallbacks){
    
    function ParticlesHandler(shouldDraw, numParticles, canvasWidth, canvasHeight, gl, zOrder, position, opts){           
        Handler.call(this, shouldDraw, zOrder, gl, canvasWidth, canvasHeight, opts);    
        this._numParticles = numParticles;
        this._timeIncrementor = 2;
        
        var randVals = [];
        var numVerticesPerParticle = 6;
        for(var i = 0; i < numParticles; i++){
            var fourRandVals = [Math.random(), Math.random(), Math.random(), Math.random()];
            for(var a = 0; a < numVerticesPerParticle; a++){
                randVals = randVals.concat(fourRandVals);
            }
        }        
        
        this._attributes.randVals = randVals;
        this._vertexBuffers.push(gl.createBuffer());
        
        this.setPosition(position);
    }   
    
    //inherit from Handler
    ParticlesHandler.prototype = Object.create(Handler.prototype);
    ParticlesHandler.prototype.constructor = ParticlesHandler;  
    
    ParticlesHandler.prototype.update = function(){
        this._uniforms.iGlobalTime.value[0] += this._timeIncrementor;
    }
    
    ParticlesHandler.prototype.doEffect = function(optCallback){
        timingCallbacks.addTimingEvents(this, this._uniforms.maxLifetime.value[0], 1, function(time){
            this._uniforms.iGlobalTime.value[0] = time;
        }, function(){
            this._shouldDraw = false;
            if(optCallback){
                optCallback();
            }
        });

        this._shouldDraw = true;
    }
    
    ParticlesHandler.prototype.reset = function(){
        this._shouldDraw = false;
        this._uniforms.iGlobalTime.value[0] = 0;
    }
    
    ParticlesHandler.prototype.setPosition = function(newPosition){
        this._uniforms.center.value[0] = newPosition.getX();
        this._uniforms.center.value[1] = newPosition.getY();
        this._generateVerticesFromCurrentState();
    }
    
    ParticlesHandler.prototype.setParticlesColor = function(r, g, b){
        this._uniforms.particlesColor.value = [r, g, b];
    }  
    
    ParticlesHandler.prototype.setTimeIncrementor = function(timeIncrementor){
        this._timeIncrementor = timeIncrementor;
    }
    
    ParticlesHandler.prototype._generateVerticesFromCurrentState = function(){        
        var centerX = this._uniforms.center.value[0];
        var centerY = this._uniforms.center.value[1];
        var radiusOfParticle = 0.02 * this._canvasHeight;
        
        this._attributes.vertexPosition = [];
        for(var i = 0; i < this._numParticles; i++){
            this._attributes.vertexPosition = this._attributes.vertexPosition.concat( getVerticesUnNormalized(centerX - radiusOfParticle, centerY - radiusOfParticle, radiusOfParticle * 2, radiusOfParticle * 2) );
        }
    }

    return ParticlesHandler;
});