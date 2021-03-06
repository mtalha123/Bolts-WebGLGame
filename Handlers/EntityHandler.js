define(['Handlers/Handler', 'Handlers/ParticleExplosionHandler', 'Custom Utility/getVerticesNormalized', 'Custom Utility/getGLCoordsFromNormalizedShaderCoords'], function(Handler, ParticleExplosionHandler, getVerticesNormalized, getGLCoordsFromNormalizedShaderCoords){
    
    function EntityHandler(shouldDraw, gl, zOrder, position, canvasWidth, canvasHeight, ShaderLibrary, opts){
        Handler.call(this, shouldDraw, zOrder, gl, canvasWidth, canvasHeight, opts);
        
        this._spawnParticlesHandler = new ParticleExplosionHandler(false, 50, canvasWidth, canvasHeight, gl, zOrder-1, position, {particlesColor: [0.0, 0.3, 1.0]}, ShaderLibrary);
        this._destructionParticlesHandler = new ParticleExplosionHandler(false, 50, canvasWidth, canvasHeight, gl, zOrder-1, position, {particlesColor: [1.0, 1.0, 0.5]}, ShaderLibrary);
        this._handlers.push(this._spawnParticlesHandler);
        this._handlers.push(this._destructionParticlesHandler);
        this._radiusMultiplierForGenVertices = 1.5;
        
        this.additiveBlending = true;
    }
    
    //inherit from Handler
    EntityHandler.prototype = Object.create(Handler.prototype);
    EntityHandler.prototype.constructor = EntityHandler;
    
    
    EntityHandler.prototype.update = function(){
        Handler.prototype.update.call(this);   
    }   
    
    EntityHandler.prototype.setPosition = function(newPosition){
        this._uniforms.center.value[0] = newPosition.getX();
        this._uniforms.center.value[1] = newPosition.getY();
        this._generateVerticesFromCurrentState();
    }
    
    EntityHandler.prototype.doSpawnEffect = function(position){
        this._spawnParticlesHandler.setPosition(position);
        this._spawnParticlesHandler.doEffect();
        this._shouldDraw = true;
    }
    
    EntityHandler.prototype.doDestroyEffect = function(position, optCallback){
        this._destructionParticlesHandler.setPosition(position);
        this._destructionParticlesHandler.doEffect(function(){
            this._destructionParticlesHandler.reset();
            if(optCallback){
                optCallback();
            }
        }.bind(this));
        this._shouldDraw = false;
    }
    
    EntityHandler.prototype._generateVerticesFromCurrentState = function(){
        var radius_t = this._uniforms.radius.value[0] * this._radiusMultiplierForGenVertices;
        var centerX = this._uniforms.center.value[0];
        var centerY = this._uniforms.center.value[1];
        
        this._attributes.vertexPosition.value = getGLCoordsFromNormalizedShaderCoords(getVerticesNormalized(centerX - radius_t, centerY - radius_t, radius_t * 2, radius_t * 2, this._canvasWidth, this._canvasHeight));
    } 
    
    return EntityHandler;
});