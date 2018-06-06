define(['Handlers/Handler', 'Handlers/BasicParticlesHandler'], function(Handler, BasicParticlesHandler){
    function EntityHandler(shouldDraw, gl, zOrder, position, canvasWidth, canvasHeight, ShaderLibrary, opts){
        Handler.call(this, shouldDraw, zOrder, gl, canvasWidth, canvasHeight, opts);
        
        this._spawnParticlesHandler = new BasicParticlesHandler(false, 50, canvasWidth, canvasHeight, gl, zOrder-1, position, {particlesColor: [0.0, 0.3, 1.0]}, ShaderLibrary);
        this._destructionParticlesHandler = new BasicParticlesHandler(false, 50, canvasWidth, canvasHeight, gl, zOrder-1, position, {particlesColor: [1.0, 1.0, 0.5]}, ShaderLibrary);
        this._handlers.push(this._spawnParticlesHandler);
        this._handlers.push(this._destructionParticlesHandler);
        
        this.additiveBlending = true;
    }
    
    //inherit from Handler
    EntityHandler.prototype = Object.create(Handler.prototype);
    EntityHandler.prototype.constructor = EntityHandler;
    
    
    EntityHandler.prototype.update = function(){
        Handler.prototype.update.call(this);   
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
    
    
    return EntityHandler;
});