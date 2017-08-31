define(['Handlers/Handler', 'Handlers/BasicParticlesHandler'], function(Handler, BasicParticlesHandler){
    function EntityHandler(shouldDraw, gl, x, y, zOrder, canvasWidth, canvasHeight, ShaderLibrary, opts){
        Handler.call(this, shouldDraw, x, y, zOrder, gl, canvasWidth, canvasHeight, opts);
        
        this._particlesHandler = new BasicParticlesHandler(false, 50, canvasWidth, canvasHeight, gl, zOrder-1, x, y, {}, ShaderLibrary);
        this._handlers.push(this._particlesHandler);
        
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
        
        this.additiveBlending = true;
    }
    
    //inherit from Handler
    EntityHandler.prototype = Object.create(Handler.prototype);
    EntityHandler.prototype.constructor = EntityHandler;
    
    
    EntityHandler.prototype.update = function(){
        Handler.prototype.update.call(this);   
        this._particlesHandler.update();
    }
    
    EntityHandler.prototype.doSpawnEffect = function(x, y){
        this._particlesHandler.setPosition(x, y);
        this._particlesHandler.doEffect();
        this._particlesHandler.setParticlesColor(0.0, 0.3, 1.0);
        this._shouldDraw = true;
    }
    
    EntityHandler.prototype.doDestroyEffect = function(x, y, optCallback){
        this._particlesHandler.setPosition(x, y);
        this._particlesHandler.doEffect(optCallback);
        this._particlesHandler.setParticlesColor(1.0, 1.0, 0.5);
        this._shouldDraw = false;
    }
    
    EntityHandler.prototype.resetProperties = function(opts){
        this._particlesHandler.reset();
        this._setToDefaultUniforms(opts);
    }
    
    EntityHandler.prototype._setToDefaultUniforms = function(opts){
        for(var uniform in this._uniformsDefault){
            for(var i = 0; i < this._uniformsDefault[uniform].value.length; i++){
                this._uniforms[uniform].value[i] = this._uniformsDefault[uniform].value[i];
            }
        }
    }
    
    
    return EntityHandler;
});