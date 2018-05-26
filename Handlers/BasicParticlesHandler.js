define(['Handlers/Handler', 'Custom Utility/getVerticesUnNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords', 'Custom Utility/Timer', 'Custom Utility/Vector', 'addToAutomaticDrawing'], function(Handler, getVerticesUnNormalized, getGLCoordsFromNormalizedShaderCoords, Timer, Vector, addToAutomaticDrawing){
    
    function BasicParticlesHandler(shouldDraw, numParticles, canvasWidth, canvasHeight, gl, zOrder, position, opts, ShaderLibrary){        
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
                value: [800, 500]
            },
            radiusOfExplosion: {
                type: "float",
                value: [150]
            },
            maxLifetime: {
                type: "float",
                value: [1500]
            },
            radiusOfSource: {
                type: "float",
                value: [50]
            },
            destination: {
                type: "vec2",
                value: [0, 0]
            },
            FXType: {
                type: "float",
                value: [1]
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
        var numVerticesPerParticle = 6;
        for(var i = 0; i < numParticles; i++){
            var randomVal = Math.random(); 
            for(var a = 0; a < numVerticesPerParticle * 4; a++){
                randVals.push(randomVal);
            }
        }        
        this._attributes.randVals = randVals;
        this._vertexBuffers.push(gl.createBuffer());
        
        this.setPosition(position);
    }   
    
    //inherit from Handler
    BasicParticlesHandler.prototype = Object.create(Handler.prototype);
    BasicParticlesHandler.prototype.constructor = BasicParticlesHandler;  
    
    BasicParticlesHandler.prototype.update = function(){
        if(this._uniforms.FXType.value[0] === 2){
            this._uniforms.iGlobalTime.value[0]+=2;
        }
    }
    
    BasicParticlesHandler.prototype.doEffect = function(optCallback){
        if(this._uniforms.FXType.value[0] === 1){
            addToAutomaticDrawing.addToAutomaticDrawing(this, this._uniforms.maxLifetime.value[0], function(time){
                this._uniforms.iGlobalTime.value[0] = time;
            }, function(){
                this._shouldDraw = false;
                if(optCallback){
                    optCallback();
                }
            });

            this._shouldDraw = true;
        }
    }
    
    BasicParticlesHandler.prototype.reset = function(){
        this._shouldDraw = false;
        this._uniforms.iGlobalTime.value[0] = 0;
    }
    
    
    BasicParticlesHandler.prototype.setPosition = function(newPosition){
        this._uniforms.center.value[0] = newPosition.getX();
        this._uniforms.center.value[1] = newPosition.getY();
        this._generateVerticesFromCurrentState();
    }
    
    BasicParticlesHandler.prototype.setParticlesColor = function(r, g, b){
        this._uniforms.particlesColor.value = [r, g, b];
    }
    
    BasicParticlesHandler.prototype.setDestinationForParticles = function(destination){
        this._uniforms.destination.value = [destination.getX(), destination.getY()];
    }
    
    BasicParticlesHandler.prototype._generateVerticesFromCurrentState = function(){        
        var centerX = this._uniforms.center.value[0];
        var centerY = this._uniforms.center.value[1];
        var radiusOfParticle = 0.02 * this._canvasHeight;
        
        this._attributes.vertexPosition = [];
        for(var i = 0; i < this._numParticles; i++){
            this._attributes.vertexPosition = this._attributes.vertexPosition.concat( getVerticesUnNormalized(centerX - radiusOfParticle, centerY - radiusOfParticle, radiusOfParticle * 2, radiusOfParticle * 2) );
        }
    }

    return BasicParticlesHandler;
});