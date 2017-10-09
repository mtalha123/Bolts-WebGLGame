define([], function(){

    function EntityDestructionState(handler){
        this._handler = handler;
    }
    
    EntityDestructionState.prototype.prepareForDrawing = function(){
        this._handler.update();
    }

    EntityDestructionState.prototype.update = function(){ }
    
    EntityDestructionState.prototype.startDestruction = function(callback, x, y){
        this._handler.doDestroyEffect(x, y, callback);
    }
    
    
    function EntityNormalState(entity){
        this._entity = entity;
        this._handler = entity._handler;
    }
    
    EntityNormalState.prototype.prepareForDrawing = function(){
        this._handler.update();        
    }

    EntityNormalState.prototype.update = function(){ }
    
    
    function Entity(canvasWidth, canvasHeight, gl, x, y){       
        this._x = this._prevX = x; 
        this._y = this._prevY = y;
        this._hitBoxRegions = null;
        this._charge = 1;
        
        this._handler = null;
        
        this._normalState = null;
        this._destructionState = null;
        this._currentState = this._normalState;
    }
    
    Entity.prototype.prepareForDrawing = function(interpolation){
        this._currentState.prepareForDrawing(interpolation);
    }
    
    Entity.prototype.update = function(){        
        this._currentState.update();
    } 
    
    Entity.prototype.setPosition = function(newX, newY){
        this._x = this._prevX = newX;  
        this._y = this._prevY = newY;
        this._handler.setPosition(newX, newY);
    }
    
    Entity.prototype._setPositionWithInterpolation = function(newX, newY){
        this._prevX = this._x;
        this._x = newX;
        
        this._prevY = this._y;
        this._y = newY;
        
        this._handler.setPosition(newX, newY);
    }
    
    Entity.prototype.getX = function(){
        return this._x;
    }
    
    Entity.prototype.getY = function(){
        return this._y;
    }
    
    Entity.prototype.spawn = function(callback){
        this._handler.doSpawnEffect(this._x, this._y);
        callback();
    }
    
    Entity.prototype.reset = function(){
        this._handler.resetProperties();
        this._handler.shouldDraw(false);
        this._currentState = this._normalState;
    }
    
    Entity.prototype.setAchievementPercentage = function(percent){
        //override
    }
    
    Entity.prototype.destroyAndReset = function(callback){
        this._currentState = this._destructionState;
        
        this._currentState.startDestruction(function(){
            this.reset();
            callback();
        }.bind(this), this._x, this._y);
    }
    
    Entity.prototype.areCoordsInHitRegions = function(checkX, checkY){
        return this._hitBoxRegions.isInAnyRegion(checkX, checkY);
    }
    
    Entity.prototype.runAchievementAlgorithmAndReturnStatus = function(){
        //override
    }
    
    Entity.prototype.getCharge = function(){
        return this._charge;
    }
    
    return {
        Entity: Entity,
        EntityNormalState: EntityNormalState,
        EntityDestructionState: EntityDestructionState
    };
});